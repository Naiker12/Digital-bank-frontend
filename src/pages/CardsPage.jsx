import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { cardService } from '@/services/cardService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { CreditCard, Loader2, Lock, PlusCircle, Wallet, Wifi } from 'lucide-react';
import { toast } from 'sonner';

function BankCard({ card, onSelect }) {
  const gradients = {
    DEBIT: 'from-slate-800 via-slate-900 to-black',
    CREDIT: 'from-indigo-600 via-violet-600 to-purple-900',
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      className="w-full text-left"
    >
      <div
        className={cn(
          'group relative aspect-[1.586/1] w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/30',
          gradients[card.type] || gradients.DEBIT
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-1000 group-hover:scale-150" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative z-10 flex h-full flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">Digital Bank</span>
              <span className="text-[8px] font-medium uppercase tracking-widest opacity-50">Premium Member</span>
            </div>
            <div className="flex h-6 w-8 items-center justify-center rounded-sm border border-white/20 bg-white/10 backdrop-blur-md">
              <Wifi className="h-3 w-3 rotate-90 opacity-80" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex h-9 w-12 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 shadow-lg">
              <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
              <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-0.5 p-1 opacity-40">
                {[...Array(9)].map((_, index) => <div key={index} className="border-[0.5px] border-black/20" />)}
              </div>
            </div>
          </div>

          <div>
            <p className="font-mono text-xl tracking-[0.25em] text-white/90 drop-shadow-md lg:text-2xl">
              {card.number.replace(/\d{4}(?=.)/g, '$& ')}
            </p>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Titular</p>
              <p className="max-w-[150px] truncate text-xs font-bold uppercase tracking-wide text-white/90">
                {card.holder}
              </p>
            </div>

            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Vence</p>
                <p className="text-xs font-bold text-white/90">{card.expiry}</p>
              </div>

              <div className="flex h-8 w-14 items-center justify-center rounded border border-white/20 bg-white/10 backdrop-blur-md">
                <span className="text-[8px] font-bold italic tracking-tighter">{card.typeLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function CardFundsDialog({ card, open, onClose, onSuccess }) {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!card) return;

    setSubmitting(true);
    const result = await cardService.applyCardFunds({
      cardId: card.uuid || card.id,
      cardType: card.type,
      amount,
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
          <DialogTitle>{actionLabel} •••• {card?.last4}</DialogTitle>
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
              <p className="text-2xl font-bold">
                {Number(card?.balance || 0).toFixed(2)} US$
              </p>
            </div>

            <Field>
              <FieldLabel htmlFor="card-amount">Monto</FieldLabel>
              <Input
                id="card-amount"
                type="number"
                min="1"
                step="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
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

export default function CardsPage() {
  const user = useAuthStore((s) => s.user);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);

  const fetchCards = async () => {
    if (!user?.uuid) return;

    try {
      setLoading(true);
      const result = await cardService.getUserCards(user.uuid);
      if (result.success) {
        const activeCards = result.data
          .filter((card) => ['ACTIVATED', 'ACTIVE', 'PENDING'].includes(card.status) || !card.status)
          .map((card) => ({
            ...card,
            holder: `${user.name || ''} ${user.lastName || ''}`.trim() || card.holderName,
            last4: (card.cardNumber || '').slice(-4),
            number: card.cardNumber || '****',
            expiry: card.expiryDate,
          }));
        setCards(activeCards);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('No se pudieron cargar tus tarjetas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user?.uuid, user?.name, user?.lastName]);

  return (
    <div className="space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-mesh-pattern opacity-10" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Tarjetas</h1>
            <p className="mt-1 text-slate-400">
              Toca una tarjeta para recargarla o pagarla según su tipo.
            </p>
          </div>
          <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
            <CreditCard className="mr-2 h-4 w-4" />
            Solicitar Nueva
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.uuid || card.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4" />
                    {card.typeLabel}
                  </CardTitle>
                  <Badge variant={card.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {card.status === 'ACTIVE' ? 'Activa' : 'Pendiente'}
                  </Badge>
                </div>
                <CardDescription>•••• {card.last4}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <BankCard card={card} onSelect={setSelectedCard} />

                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo</p>
                    <p className="text-lg font-bold">
                      {Number(card.balance || 0).toFixed(2)} US$
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedCard(card)}>
                    {card.type === 'CREDIT' ? 'Pagar' : 'Recargar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CardFundsDialog
        card={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onSuccess={fetchCards}
      />
    </div>
  );
}
