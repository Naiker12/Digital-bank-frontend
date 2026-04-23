import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Wifi } from 'lucide-react';

const CARD_STYLES = {
  DEBIT: {
    background: 'linear-gradient(135deg, #FFD600 0%, #F5A800 50%, #E08C00 100%)',
  },
  CREDIT_ACTIVE: {
    background: 'linear-gradient(135deg, #E53935 0%, #C62828 50%, #7B0000 100%)',
  },
  CREDIT_PENDING: {
    background: 'linear-gradient(135deg, #B71C1C 0%, #7F0000 50%, #3E0000 100%)',
  },
};

function getCardStyle(card, locked = false) {
  if (card.type === 'CREDIT' && (card.status === 'PENDING' || locked)) {
    return CARD_STYLES.CREDIT_PENDING;
  }

  if (card.type === 'CREDIT') {
    return CARD_STYLES.CREDIT_ACTIVE;
  }

  return CARD_STYLES.DEBIT;
}

export default function BankCard({ card, locked = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [showSecurityCode, setShowSecurityCode] = useState(false);

  const isPending = card.type === 'CREDIT' && locked;
  const isDebit = card.type === 'DEBIT';
  const frontTextPrimary = isDebit ? 'text-slate-900' : 'text-white';
  const frontTextSecondary = isDebit ? 'text-slate-600' : 'text-white/70';
  const frontTextMuted = isDebit ? 'text-slate-500' : 'text-white/50';
  const frontStroke = isDebit ? 'border-black/15 bg-black/10' : 'border-white/25 bg-white/10';
  const frontWifi = isDebit ? 'text-slate-700' : 'text-white/85';

  const rawNumber = String(card.number || card.cardNumber || '').replace(/\D/g, '');
  const displayNumber = rawNumber ? rawNumber.match(/.{1,4}/g)?.join(' ') || rawNumber : '****';
  const last4 = rawNumber.slice(-4) || '****';
  const isFlipped = isHovered || isPinned;
  const holderName = card.holder || card.holderName || 'TITULAR';
  const expiryDate = card.expiry || card.expiryDate || '12/28';

  const rawCvv = String(card.securityCode ?? card.cvv ?? card.cvc ?? '').replace(/\D/g, '');
  const securityCode = rawCvv.length >= 3 ? rawCvv.slice(0, 3) : null;
  const securityDisplay = showSecurityCode && securityCode ? securityCode : '•••';

  return (
    <button
      type="button"
      onClick={() => setIsPinned((value) => !value)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-pressed={isFlipped}
      className="w-full text-left outline-none"
    >
      <div
        className={cn(
          'group relative aspect-[1.586/1] w-full overflow-hidden rounded-3xl shadow-2xl transition-transform duration-500 will-change-transform hover:scale-[1.02]',
          isPending && 'opacity-95'
        )}
        style={{
          perspective: '1200px',
          ...getCardStyle(card, locked),
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-white/8" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.16),transparent_32%)]" />

        <div
          className="relative z-10 h-full w-full transition-transform duration-700 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${isFlipped ? 180 : 0}deg)`,
          }}
        >
          <div className="absolute inset-0 p-6 sm:p-7" style={{ backfaceVisibility: 'hidden' }}>
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className={cn('text-[10px] font-bold uppercase tracking-[0.4em]', frontTextMuted)}>
                    Banco Unión
                  </span>
                  <span className={cn('text-[8px] font-medium uppercase tracking-widest', frontTextMuted)}>
                    Digital Member
                  </span>
                </div>
                <div className={cn('flex h-6 w-8 items-center justify-center rounded-sm border backdrop-blur-md', frontStroke)}>
                  <Wifi className={cn('h-3 w-3 rotate-90', frontWifi)} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div
                  className="relative flex h-10 w-14 items-center justify-center overflow-hidden rounded-md shadow-lg"
                  style={{
                    background:
                      'linear-gradient(135deg, #d4a843 0%, #f5d676 40%, #c9931e 70%, #e8be55 100%)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background:
                        'repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
                    }}
                  />
                  <div className="grid h-full w-full grid-cols-3 grid-rows-3 gap-[1.5px] p-[4px]">
                    {[...Array(9)].map((_, index) => (
                      <div
                        key={index}
                        className="rounded-[1px]"
                        style={{
                          background: 'rgba(120,70,0,0.18)',
                          border: '0.5px solid rgba(180,120,0,0.25)',
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className={cn('rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-[0.25em]', frontStroke, frontTextPrimary)}>
                  {card.typeLabel}
                </div>
              </div>

              <div className="min-w-0">
                <p className={cn('text-[10px] font-bold uppercase tracking-[0.35em]', frontTextMuted)}>Terminación</p>
                <p className={cn('mt-2 whitespace-nowrap font-mono text-[clamp(0.95rem,1.6vw,1.2rem)] leading-none tracking-[0.18em] drop-shadow-sm', frontTextPrimary)}>
                  •••• {last4}
                </p>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className={cn('text-[8px] font-bold uppercase tracking-widest', frontTextMuted)}>Titular</p>
                  <p className={cn('max-w-[150px] truncate text-xs font-bold uppercase tracking-wide', frontTextPrimary)}>
                    {holderName}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn('text-[8px] font-bold uppercase tracking-widest', frontTextMuted)}>Vence</p>
                  <p className={cn('text-xs font-bold', frontTextPrimary)}>{expiryDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 overflow-hidden rounded-3xl p-6 sm:p-7 text-slate-900"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/96 via-slate-100/92 to-slate-200/92 backdrop-blur-sm" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.05),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.08),transparent_32%)]" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-700">Detalles</span>
                  <span className="text-[8px] font-medium uppercase tracking-widest text-slate-500">Vista reversa</span>
                </div>
                <div className="flex h-6 w-8 items-center justify-center rounded-sm border border-slate-300 bg-white/80 backdrop-blur-md">
                  <Wifi className="h-3 w-3 rotate-90 text-slate-600" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.75rem] bg-slate-200/90 p-4 shadow-inner shadow-slate-300/40 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">Número completo</p>
                  <p className="mt-2 overflow-hidden whitespace-nowrap font-mono text-[clamp(0.78rem,1vw,0.98rem)] tracking-[0.1em] text-slate-900">
                    {displayNumber}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="rounded-xl bg-white/85 p-3 shadow-sm backdrop-blur-sm">
                    <p className="font-bold uppercase tracking-widest text-slate-500">Titular</p>
                    <p className="mt-1 truncate text-sm font-extrabold text-slate-900">{holderName}</p>
                  </div>
                  <div className="rounded-xl bg-white/85 p-3 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold uppercase tracking-widest text-slate-500">Código seguro</p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (securityCode) {
                            setShowSecurityCode((value) => !value);
                          }
                        }}
                        disabled={!securityCode}
                        className={cn(
                          'inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition',
                          securityCode ? 'hover:border-slate-300 hover:text-slate-700' : 'cursor-not-allowed opacity-40'
                        )}
                        aria-label={showSecurityCode ? 'Ocultar CVV' : 'Mostrar CVV'}
                      >
                        {showSecurityCode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <p className="mt-1 text-base font-extrabold tracking-[0.35em] text-slate-900">
                      {securityDisplay}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Terminación</p>
                  <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    •••• {last4}
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Vence</p>
                    <p className="text-xs font-bold text-slate-900">{expiryDate}</p>
                  </div>
                  <div className="flex h-8 w-14 items-center justify-center rounded border border-slate-300 bg-white/80 backdrop-blur-md">
                    <span className="text-[8px] font-bold italic tracking-tighter text-slate-700">{card.typeLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
