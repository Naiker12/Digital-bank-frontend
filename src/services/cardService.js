import { cardApi } from '@/api/apiClient';
import { parseResponse, handleError } from './serviceUtils';

/**
 * Normaliza los datos de la tarjeta para la UI
 */
export function normalizeCard(card) {
  return {
    id: card.id || card.uuid || card.ID,
    cardNumber: card.card_number || card.cardNumber || '****',
    balance: parseFloat(card.balance || 0),
    type: card.type || 'Débito',
    expiryDate: card.expiry_date || card.expiryDate || '12/28',
    holderName: card.holder_name || card.holderName || 'Usuario Premium',
    network: card.network || 'Visa',
    status: card.status || card.Estado || 'ACTIVE',
    purchaseCount: card.purchaseCount || 0, // Mocked for activation rule demo
  };
}

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

      // La API puede retornar una lista o un objeto único envuelto
      const cards = Array.isArray(data) ? data : (data.cards || [data]);
      const normalizedCards = cards.map(normalizeCard);

      return { success: true, data: normalizedCards };
    } catch (error) {
      return handleError(error, 'Error al obtener tarjetas');
    }
  }
};
