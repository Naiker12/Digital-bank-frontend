import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { cardService, getDebitPurchaseCount } from '@/services/cardService';
import { paymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import PaymentTracker from '@/components/catalog/PaymentTracker';

export default function PaymentModal({ service, open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [traceId, setTraceId] = useState(null);
  const [purchaseCount, setPurchaseCount] = useState(0);
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!open || !user?.uuid) return;
    const loadAppData = async () => {
      setLoadingCards(true);
      try {
        const result = await cardService.getUserCards(user.uuid);
        if (result.success) {
          const filteredCards = result.data.filter(
            (c) => ['ACTIVATED', 'ACTIVE', 'PENDING'].includes(c.status) || !c.status
          );
          setCards(filteredCards);
          const count = await getDebitPurchaseCount(user.uuid, filteredCards);
          setPurchaseCount(count);
        }
      } catch (err) {
        console.error('Error loading modal data:', err);
      } finally {
        setLoadingCards(false);
      }
    };
    loadAppData();
  }, [open, user?.uuid]);

  useEffect(() => {
    if (!traceId) return;
    const pollStatus = async () => {
      const result = await paymentService.getPaymentStatus(traceId);

      if (!result.success) {
        setPaymentStatus('FAILED');
        setPaymentError(result.message || 'No se pudo consultar el estado del pago');
        clearInterval(pollingRef.current);
        toast.error(result.message || 'No se pudo consultar el estado del pago');
        return;
      }

      const { status, error: apiError } = result;
      setPaymentStatus(status);
      if (apiError) setPaymentError(apiError);

      if (status === 'FINISH' || status === 'FAILED') {
        clearInterval(pollingRef.current);
        if (status === 'FINISH') {
          toast.success(`Pago a ${service.proveedor} completado`);
        } else {
          toast.error(apiError || 'Pago fallido');
        }
      }
    };

    pollStatus();
    pollingRef.current = setInterval(pollStatus, 1500);

    return () => clearInterval(pollingRef.current);
  }, [traceId, service?.proveedor]);

  const handlePay = async () => {
    if (!selectedCard) return;
    setPaymentStatus('INITIAL');
    setPaymentError(null);

    const cardId = selectedCard.uuid || selectedCard.id;
    if (!cardId) {
      setPaymentStatus('FAILED');
      setPaymentError('No se pudo identificar la tarjeta seleccionada.');
      toast.error('No se pudo identificar la tarjeta seleccionada.');
      return;
    }

    const result = await paymentService.initiatePayment({
      cardId,
      service,
      userId: user?.uuid,
    });

    if (result.success) {
      setTraceId(result.traceId);
    } else {
      setPaymentStatus('FAILED');
      setPaymentError(result.message);
      toast.error(result.message);
    }
  };

  const handleClose = () => {
    setPaymentStatus(null);
    setPaymentError(null);
    setSelectedCard(null);
    setTraceId(null);
    onClose();
  };

  const formatCardNumber = (num) => (num ? num.slice(-4) : '****');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100vw-1rem)] max-w-md sm:w-full">
        {paymentStatus ? (
          <PaymentTracker
            status={paymentStatus}
            error={paymentError}
            service={service}
            onReset={handleClose}
          />
        ) : (
          <div className="space-y-5 pt-1 sm:space-y-6 sm:pt-2">
            <DialogHeader>
              <DialogTitle>Confirmar pago de servicio</DialogTitle>
              <DialogDescription className="sr-only">
                Detalles del servicio y selección de método de pago.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 sm:space-y-6">

              <div className="rounded-lg bg-muted p-4 text-center sm:p-6">
                <p className="text-xs text-muted-foreground mb-1">Total a pagar</p>
                <p className="text-3xl font-bold leading-none sm:text-4xl">
                  {service.precio_mensual.toFixed(2)} <span className="text-xl opacity-40">US$</span>
                </p>
                <p className="mt-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider sm:text-xs">
                  {service.proveedor} — {service.servicio}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Medio de Pago
                  </span>
                  <span className="text-[10px] font-bold text-primary uppercase">
                    Seguro SSL
                  </span>
                </div>

                {loadingCards ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : cards.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No tienes tarjetas activas disponibles.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cards.map((card) => (
                      (() => {
                        const isCreditLocked = card.type === 'CREDIT' && purchaseCount < 10;
                        const isDisabled = card.status === 'PENDING' || isCreditLocked;
                        const remaining = Math.max(10 - purchaseCount, 0);

                        return (
                      <button
                        key={card.id}
                        type="button"
                        disabled={isDisabled}
                            onClick={() => !isDisabled && setSelectedCard(card)}
                        className={cn(
                          'flex w-full flex-col gap-4 rounded-xl border p-3 text-left transition-all sm:flex-row sm:items-center sm:justify-between sm:p-4',
                          isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-50',
                          selectedCard?.id === card.id
                            ? 'border-primary bg-primary/[0.04] ring-1 ring-primary'
                            : 'border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900'
                        )}
                      >
                        <div className="flex min-w-0 items-start gap-4 text-left">
                          <div className={cn(
                            'h-10 w-14 shrink-0 rounded-lg flex items-center justify-center transition-all',
                            selectedCard?.id === card.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                          )}>
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">
                              {card.type} <span className="font-medium text-muted-foreground">•••• {formatCardNumber(card.cardNumber)}</span>
                            </p>
                            {isDisabled ? (
                              <div className="mt-1 flex items-center gap-2">
                                <div className="h-1.5 w-16 shrink-0 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-amber-500 transition-all duration-700"
                                    style={{ width: `${Math.min((purchaseCount / 10) * 100, 100)}%` }}
                                  />
                                </div>
                                <p className="text-[9px] text-amber-600 font-bold uppercase">
                                  {purchaseCount}/10 para activar
                                </p>
                              </div>
                            ) : (
                              <p className="text-[10px] text-muted-foreground font-medium leading-snug">
                                Disponible: <span className="font-bold text-foreground">${parseFloat(card.balance || 0).toLocaleString()}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className={cn(
                          'h-5 w-5 self-end shrink-0 rounded-full border-2 flex items-center justify-center transition-all sm:self-auto',
                          selectedCard?.id === card.id ? 'border-primary bg-primary' : 'border-slate-200'
                        )}>
                          {selectedCard?.id === card.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                        );
                      })()
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Button
                  className="w-full rounded-xl py-5 text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20 sm:py-6"
                  disabled={!selectedCard}
                  onClick={handlePay}
                >
                  Confirmar y Pagar
                </Button>

                <div className="flex flex-col items-center gap-3 pt-1">
                  <p className="px-4 text-center text-[9px] font-medium leading-relaxed text-muted-foreground sm:px-6">
                    Al confirmar, autorizas a <span className="font-bold text-foreground">Banco Unión</span> a debitar el monto especificado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
