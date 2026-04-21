import { cn } from '@/lib/utils';
import { ArrowUpRight, ArrowDownRight, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const TYPE_LABELS = {
  PURCHASE: 'Compra',
  SAVING: 'Recarga',
  PAYMENT_BALANCE: 'Pago',
};

/**
 * Tabla responsiva de transacciones: tarjetas en móvil, tabla en desktop.
 * Muestra un estado vacío elegante cuando no hay datos.
 */
export default function TransactionTable({ transactions, onSelectTransaction }) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <p className="text-sm font-bold">No hay movimientos</p>
        <p className="text-xs text-muted-foreground mt-1">
          No se encontraron transacciones con el filtro seleccionado.
        </p>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden bg-transparent md:bg-card">
      <CardContent className="p-0">
        {/* Vista Móvil */}
        <div className="space-y-3 md:hidden p-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction?.(tx)}
              className="flex items-center justify-between rounded-xl border border-border/40 bg-card p-4 shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm',
                  tx.isIncome ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                )}>
                  {tx.isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold tracking-tight truncate">{tx.description}</p>
                  <p className="text-[11px] font-medium uppercase text-muted-foreground">
                    {tx.date} • {TYPE_LABELS[tx.type] || tx.type}
                  </p>
                </div>
              </div>
              <p className={cn('text-sm font-bold whitespace-nowrap pl-3', tx.isIncome ? 'text-emerald-600' : 'text-red-500')}>
                {tx.isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Vista Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-muted/30">
              <TableRow className="border-muted hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4 w-10" />
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Descripción</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4 text-center">Tipo</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Fecha</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4 text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow 
                  key={tx.id} 
                  onClick={() => onSelectTransaction?.(tx)}
                  className="group hover:bg-primary/[0.02] border-muted/20 cursor-pointer transition-colors"
                >
                  <TableCell>
                    <div className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl transition-transform group-hover:scale-110 shadow-sm',
                      tx.isIncome ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                    )}>
                      {tx.isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold tracking-tight group-hover:text-primary transition-colors">
                    {tx.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100 group-hover:bg-primary/5 transition-all">
                      {TYPE_LABELS[tx.type] || tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-medium">{tx.date}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn('font-bold tracking-tight', tx.isIncome ? 'text-emerald-600' : 'text-red-500')}>
                      {tx.isIncome ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
