import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { MOCK_CARDS } from '@/data/mockData';
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
import { CreditCard, Wifi, Lock, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// ─── COMPONENTE VISUAL DE TARJETA ──────────────────────
function BankCard({ card }) {
  const gradients = {
    DEBIT: 'from-slate-800 via-slate-900 to-black',
    CREDIT: 'from-indigo-600 via-violet-600 to-purple-900',
  };

  return (
    <div
      className={cn(
        "relative aspect-[1.586/1] w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/30 group",
        "bg-gradient-to-br",
        gradients[card.type] || gradients.DEBIT
      )}
    >
      {/* Textura de Metal / Ruido Sutil */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      {/* Brillos Dinámicos (Overlay) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Círculos de Cristal (Glassmorphism) */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-1000 group-hover:scale-150" />
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        {/* Fila superior */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-[0.4em] opacity-80 decoration-primary decoration-2 underline-offset-4 uppercase">
              Digital Bank
            </span>
            <span className="text-[8px] font-medium opacity-50 tracking-widest uppercase">Premium Member</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-8 rounded-sm bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Wifi className="h-3 w-3 rotate-90 opacity-80" />
            </div>
          </div>
        </div>

        {/* Chip Magnético */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-9 w-12 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 shadow-lg">
            <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
            <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-0.5 p-1 opacity-40">
              {[...Array(9)].map((_, i) => <div key={i} className="border-[0.5px] border-black/20" />)}
            </div>
          </div>
        </div>

        {/* Número de Tarjeta */}
        <div>
          <p className="font-mono text-xl tracking-[0.25em] drop-shadow-md lg:text-2xl text-white/90">
            {card.number.replace(/\d{4}(?=.)/g, '$& ')}
          </p>
        </div>

        {/* Fila inferior */}
        <div className="flex items-end justify-between">
          <div className="space-y-0">
            <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Titular</p>
            <p className="text-xs font-bold tracking-wide uppercase text-white/90 truncate max-w-[150px]">
              {card.holder}
            </p>
          </div>

          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-[8px] font-bold uppercase tracking-widest opacity-40">Vence</p>
              <p className="text-xs font-bold text-white/90">{card.expiry}</p>
            </div>

            <div className="flex h-8 w-12 items-center justify-center rounded bg-white/10 backdrop-blur-md border border-white/20">
              <span className="text-[8px] font-bold italic tracking-tighter">{card.type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DIÁLOGO PARA PAGAR TARJETA ────────────────────────
function PayCardDialog({ card, open, onClose }) {
  const [amount, setAmount] = useState('');
  const [paid, setPaid] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    // Simular pago
    setPaid(true);
    toast.info('Procesando pago...');
    setTimeout(() => {
      setPaid(false);
      setAmount('');
      toast.success('¡Tarjeta pagada con éxito!');
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pagar tarjeta •••• {card?.last4}</DialogTitle>
          <DialogDescription className="sr-only">
            Proceso de pago para la tarjeta seleccionada.
          </DialogDescription>
        </DialogHeader>

        {paid ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            <p className="font-semibold">¡Pago exitoso!</p>
          </div>
        ) : (
          <form onSubmit={handlePay}>
            <FieldGroup>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-xs text-muted-foreground">Saldo actual</p>
                <p className="text-2xl font-bold">
                  {card?.balance?.toFixed(2)} US$
                </p>
                {card?.creditLimit && (
                  <p className="text-xs text-muted-foreground">
                    Cupo: {card.creditLimit.toFixed(2)} US$
                  </p>
                )}
              </div>

              <Field>
                <FieldLabel htmlFor="pay-amount">Monto a pagar</FieldLabel>
                <Input
                  id="pay-amount"
                  type="number"
                  placeholder="100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                />
              </Field>

              <Field>
                <Button type="submit" className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Confirmar pago
                </Button>
              </Field>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── PÁGINA DE TARJETAS ────────────────────────────────
export default function CardsPage() {
  const user = useAuthStore((s) => s.user);
  const cards = MOCK_CARDS.filter((c) => c.user_id === user?.uuid);
  const [payCard, setPayCard] = useState(null);

  return (
    <div className="space-y-8 pb-10">
      {/* Cabecera Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-mesh-pattern opacity-10" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Tarjetas</h1>
            <p className="mt-1 text-slate-400">
              Gestiona tus métodos de pago y límites de crédito con seguridad.
            </p>
          </div>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            <CreditCard className="mr-2 h-4 w-4" />
            Solicitar Nueva
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.uuid}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {card.type === 'DEBIT' ? 'Débito' : 'Crédito'}
                </CardTitle>
                <Badge
                  variant={
                    card.status === 'ACTIVE' ? 'default' : 'secondary'
                  }
                >
                  {card.status === 'ACTIVE' ? 'Activa' : 'Pendiente'}
                </Badge>
              </div>
              <CardDescription>•••• {card.last4}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <BankCard card={card} />

              <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Saldo</p>
                  <p className="text-lg font-bold">
                    {card.balance.toFixed(2)} US$
                  </p>
                </div>
                {card.creditLimit && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Cupo</p>
                    <p className="text-sm font-semibold">
                      {card.creditLimit.toFixed(2)} US$
                    </p>
                  </div>
                )}
              </div>

              {card.status === 'ACTIVE' && card.type === 'CREDIT' && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setPayCard(card)}
                >
                  Pagar tarjeta
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Diálogo de pago */}
      <PayCardDialog
        card={payCard}
        open={!!payCard}
        onClose={() => setPayCard(null)}
      />
    </div>
  );
}
