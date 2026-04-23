import { useEffect, useState } from 'react';
import { cardService } from '@/services/cardService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Loader2, Lock, PlusCircle, Wallet } from 'lucide-react';
import { toast } from 'sonner';

const CARD_AMOUNT = 1000;

export default function CardFundsDialog({ card, open, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setAmount('');
      setMerchant('');
      setSubmitting(false);
    }
  }, [open]);

  const isCreditCard = card?.type === 'CREDIT';
  const actionLabel = isCreditCard ? 'Pagar tarjeta' : 'Recargar tarjeta';
  const helperLabel = isCreditCard ? 'Pago de tarjeta' : 'Recarga de tarjeta';

  const handleAmountChange = (event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '');

    if (digitsOnly.length > 4) {
      toast.error('El monto no puede tener más de 4 dígitos');
    }

    setAmount(digitsOnly.slice(0, 4));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!card) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount !== CARD_AMOUNT) {
      toast.error(`El monto debe ser exactamente de ${CARD_AMOUNT.toFixed(2)} US$`);
      return;
    }

    setSubmitting(true);
    const result = await cardService.applyCardFunds({
      cardId: card.uuid || card.id,
      cardType: card.type,
      amount: numericAmount,
      merchant,
    });
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.message || 'No se pudo procesar la operación');
      return;
    }

    toast.success(result.message || `${actionLabel} aplicada correctamente`);
    onSuccess?.();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionLabel} •••• {card?.last4}
          </DialogTitle>
          <DialogDescription>
            {isCreditCard
              ? 'Aplica un pago a esta tarjeta de crédito y actualiza el saldo disponible.'
              : 'Agrega saldo a esta tarjeta para poder seguir usándola en compras y pagos.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-xs text-muted-foreground">Saldo actual</p>
              <p className="text-2xl font-bold">{Number(card?.balance || 0).toFixed(2)} US$</p>
            </div>

            <Field>
              <FieldLabel htmlFor="card-amount">Monto</FieldLabel>
              <Input
                id="card-amount"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="1000"
                value={amount}
                onChange={handleAmountChange}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                El monto permitido es de {CARD_AMOUNT.toFixed(2)} US$.
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="card-merchant">Referencia</FieldLabel>
              <Input
                id="card-merchant"
                type="text"
                placeholder={helperLabel}
                value={merchant}
                onChange={(event) => setMerchant(event.target.value)}
              />
            </Field>

            <Field>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isCreditCard ? (
                  <Wallet className="mr-2 h-4 w-4" />
                ) : (
                  <PlusCircle className="mr-2 h-4 w-4" />
                )}
                <Lock className="mr-2 h-4 w-4" />
                {submitting ? 'Procesando...' : actionLabel}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
