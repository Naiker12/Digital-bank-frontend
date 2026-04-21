import { cardApi } from '@/api/apiClient';
import { parseResponse, handleError } from './serviceUtils';

const CREDIT_CARD_TYPES = new Set(['CREDIT', 'CREDITO', 'CRÉSITO', 'CRÉDITO']);
const DEBIT_CARD_TYPES = new Set(['DEBIT', 'DEBITO', 'DÉBITO', 'DÉBIT']);
const PURCHASE_TYPES = new Set(['PURCHASE', 'COMPRA', 'EXPENSE', 'PAGO_SERVICIO', 'TRANSACCION', 'SALE', 'TRANSACTION']);
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Normaliza los datos de la tarjeta para la UI
 */
export function normalizeCard(card) {
  const id = card.id || card.uuid || card.ID;
  const rawType = String(card.type || 'DEBIT').toUpperCase();

  return {
    id,
    uuid: id,
    cardNumber: card.card_number || card.cardNumber || '****',
    balance: parseFloat(card.balance || 0),
    type: DEBIT_CARD_TYPES.has(rawType) ? 'DEBIT' : (CREDIT_CARD_TYPES.has(rawType) ? 'CREDIT' : rawType),
    typeLabel: CREDIT_CARD_TYPES.has(rawType) ? 'Crédito' : 'Débito',
    expiryDate: card.expiry_date || card.expiryDate || '12/28',
    holderName: card.holder_name || card.holderName || 'Usuario Digital',
    network: card.network || 'Visa',
    status: card.status || card.Estado || 'ACTIVE',
    purchaseCount: card.purchaseCount || 0,
  };
}

export function normalizeTransaction(transaction, cardId) {
  const type = String(transaction.type || 'UNKNOWN').toUpperCase();
  const amount = Number(transaction.amount || 0);
  const createdAt = transaction.createdAt || transaction.date || transaction.timestamp || null;
  const merchant = transaction.merchant || transaction.description || 'Movimiento';
  const isIncome = type === 'SAVING' || type === 'PAYMENT_BALANCE' || type === 'INCOME';
  const isExpense = PURCHASE_TYPES.has(type);
  const signedAmount = isIncome ? amount : isExpense ? -amount : amount;
  const parsedDate = createdAt ? new Date(createdAt) : null;

  return {
    id: transaction.id || transaction.uuid || `${cardId}-${createdAt || merchant}-${amount}`,
    cardId: transaction.cardId || cardId,
    type,
    merchant,
    description: merchant,
    amount,
    signedAmount,
    isIncome,
    isExpense,
    createdAt,
    date: parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
      : 'Sin fecha',
    monthLabel: parsedDate && !Number.isNaN(parsedDate.getTime())
      ? MONTH_LABELS[parsedDate.getMonth()]
      : null,
    year: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : null,
    rawDate: parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null,
  };
}

/**
 * Calcula el número total de compras (PURCHASE) realizadas con tarjetas
 * de débito del usuario. Se usa para mostrar el progreso X/10 de
 * activación de la tarjeta de crédito.
 */
async function getDebitPurchaseCount(userUuid, externalCards = null) {
  try {
    if (!userUuid) return 0;
    
    let cards;
    if (externalCards) {
      cards = externalCards;
    } else {
      const cardsResult = await cardService.getUserCards(userUuid);
      if (!cardsResult.success) return 0;
      cards = cardsResult.data;
    }

    const debitCards = cards.filter(
      (card) => card.type === 'DEBIT'
    );

    if (debitCards.length === 0) return 0;

    const reports = await Promise.allSettled(
      debitCards.map((card) => cardService.getCardReport(card.uuid || card.id))
    );

    const allTransactions = reports
      .filter((r) => r.status === 'fulfilled' && r.value.success)
      .flatMap((r) => r.value.data.transactions || []);

    const count = allTransactions.filter((tx) => tx.isExpense || PURCHASE_TYPES.has(tx.type)).length;
    console.log(`[cardService] Cálculado purchaseCount: ${count} para usuario ${userUuid}`);
    return count;
  } catch (error) {
    console.error('[cardService] Error en getDebitPurchaseCount:', error);
    return 0;
  }
}

export { getDebitPurchaseCount };

export const cardService = {
  /**
   * Obtiene la billetera del usuario (todas sus tarjetas)
   */
  getUserCards: async (userUuid) => {
    try {
      if (!userUuid) throw new Error('User UUID es requerido');

      const response = await cardApi.get(`/card/user/${userUuid}`);
      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }

      const cards = Array.isArray(data) ? data : (data.cards || [data]);
      const normalizedCards = cards.map(normalizeCard);

      return { success: true, data: normalizedCards };
    } catch (error) {
      return handleError(error, 'Error al obtener tarjetas');
    }
  },

  /**
   * Obtiene el reporte de movimientos de una tarjeta.
   */
  getCardReport: async (cardId) => {
    try {
      if (!cardId) throw new Error('Card ID es requerido');

      const response = await cardApi.get(`/card/report/${cardId}`);
      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }

      const transactions = Array.isArray(data.transactions)
        ? data.transactions.map((transaction) => normalizeTransaction(transaction, cardId))
        : [];

      return {
        success: true,
        data: {
          cardId,
          transactions,
          summary: {
            income: Number(data.summary?.income || 0),
            expenses: Number(data.summary?.expenses || 0),
          },
        },
      };
    } catch (error) {
      return handleError(error, 'Error al obtener el reporte de la tarjeta');
    }
  },

  /**
   * Recarga una tarjeta débito o aplica pago a una tarjeta crédito.
   */
  applyCardFunds: async ({ cardId, cardType, amount, merchant }) => {
    try {
      if (!cardId) throw new Error('Card ID es requerido');
      if (!amount || Number(amount) <= 0) throw new Error('El monto debe ser mayor a cero');

      const normalizedType = String(cardType || 'DEBIT').toUpperCase();
      const endpoint = CREDIT_CARD_TYPES.has(normalizedType)
        ? `/card/paid/${cardId}`
        : `/transactions/save/${cardId}`;
      const defaultMerchant = CREDIT_CARD_TYPES.has(normalizedType) ? 'Pago de tarjeta' : 'Recarga de tarjeta';

      const response = await cardApi.post(endpoint, {
        cardId,
        amount: Number(amount),
        merchant: merchant?.trim() || defaultMerchant,
      });

      const data = parseResponse(response);

      if (data.error) {
        return { success: false, message: data.error };
      }

      return {
        success: true,
        data,
        message: data.message || 'Operación procesada correctamente',
      };
    } catch (error) {
      return handleError(error, 'Error al procesar la operación de la tarjeta');
    }
  },
};
