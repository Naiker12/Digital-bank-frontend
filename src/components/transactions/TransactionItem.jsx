import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TransactionItem({ transaction }) {
  return (
    <div className="group flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-4">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110',
          transaction.isIncome ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
        )}>
          {transaction.isIncome
            ? <ArrowUpRight className="h-5 w-5" />
            : <ArrowDownRight className="h-5 w-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-tight truncate">{transaction.description}</p>
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            {transaction.date} • {transaction.type}
          </p>
        </div>
      </div>
      <div className="text-right whitespace-nowrap pl-3">
        <p className={cn('text-sm font-bold', transaction.isIncome ? 'text-emerald-600' : 'text-red-500')}>
          {transaction.isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </p>
      </div>
    </div>
  );
}
