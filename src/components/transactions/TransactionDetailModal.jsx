import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Calendar,
  CreditCard,
  Hash,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';

const TYPE_LABELS = {
  PURCHASE: 'Compra',
  SAVING: 'Recarga',
  PAYMENT_BALANCE: 'Pago',
};

export default function TransactionDetailModal({ transaction, open, onClose }) {
  if (!transaction) return null;

  const isIncome = transaction.isIncome;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
        <DialogHeader className="flex flex-col items-center justify-center pb-2">
          <div className={cn(
            'h-16 w-16 rounded-full flex items-center justify-center mb-4 shadow-inner transition-transform hover:scale-105',
            isIncome ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
          )}>
            {isIncome ? <ArrowUpRight className="h-8 w-8" /> : <ArrowDownRight className="h-8 w-8" />}
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">Detalles del Movimiento</DialogTitle>
          <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground pt-1">
            Transacción #{transaction.id?.slice(-8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">

          <div className="text-center pb-2">
            <p className={cn(
              'text-4xl font-black tracking-tighter',
              isIncome ? 'text-emerald-600' : 'text-red-500'
            )}>
              {isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
            </p>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Monto total en US$
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-2xl bg-muted/30 p-5 border border-border/40">
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Receipt className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Descripción</span>
              </div>
              <span className="text-sm font-black text-right truncate max-w-[200px]">{transaction.description}</span>
            </div>

            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Tipo</span>
              </div>
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2 py-0">
                {TYPE_LABELS[transaction.type] || transaction.type}
              </Badge>
            </div>

            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Fecha</span>
              </div>
              <span className="text-sm font-bold">{transaction.date}</span>
            </div>

            {transaction.createdAt && (
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Hora</span>
                </div>
                <span className="text-sm font-bold text-muted-foreground">
                  {new Date(transaction.createdAt).toLocaleTimeString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3 text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Tarjeta</span>
              </div>
              <span className="text-sm font-bold text-primary">Terminada en {transaction.cardId?.slice(-4) || '****'}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            className="w-full rounded-2xl py-6 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
            onClick={onClose}
          >
            Cerrar Detalle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
