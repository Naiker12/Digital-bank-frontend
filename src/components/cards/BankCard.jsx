import { cn } from '@/lib/utils';
import { Wifi, ShieldOff } from 'lucide-react';

const CARD_GRADIENTS = {
  DEBIT: 'from-slate-800 via-slate-900 to-black',
  CREDIT_ACTIVE: 'from-indigo-600 via-violet-600 to-purple-900',
  CREDIT_PENDING: 'from-rose-800 via-red-900 to-red-950',
};

function getCardGradient(card) {
  if (card.type === 'CREDIT' && card.status === 'PENDING') {
    return CARD_GRADIENTS.CREDIT_PENDING;
  }
  if (card.type === 'CREDIT') {
    return CARD_GRADIENTS.CREDIT_ACTIVE;
  }
  return CARD_GRADIENTS.DEBIT;
}

/**
 * Componente visual que renderiza el aspecto físico de una tarjeta bancaria.
 * Cambia de gradiente según tipo (DEBIT/CREDIT) y estado (PENDING).
 */
export default function BankCard({ card, onSelect, purchaseCount = 0 }) {
  const isPending = card.type === 'CREDIT' && card.status === 'PENDING';

  return (
    <button
      type="button"
      onClick={() => onSelect(card)}
      className="w-full text-left"
    >
      <div
        className={cn(
          'group relative aspect-[1.586/1] w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-primary/30',
          getCardGradient(card),
          isPending && 'opacity-80'
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl transition-transform duration-1000 group-hover:scale-150" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />

        {isPending && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-black/40 px-6 py-4 backdrop-blur-md">
              <ShieldOff className="h-8 w-8 text-red-300 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-200">
                {purchaseCount}/10 Compras con débito
              </span>
            </div>
          </div>
        )}

        <div className="relative z-10 flex h-full flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80">Banco Unión</span>
              <span className="text-[8px] font-medium uppercase tracking-widest opacity-50">Digital Member</span>
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
