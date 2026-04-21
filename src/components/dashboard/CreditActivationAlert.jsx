import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldOff } from 'lucide-react';

/**
 * Alerta visual que indica al usuario que su tarjeta de crédito está
 * pendiente de activación y muestra el progreso actual de compras con débito.
 */
export default function CreditActivationAlert({ purchaseCount }) {
  const remaining = 10 - purchaseCount;
  const progress = Math.min((purchaseCount / 10) * 100, 100);

  return (
    <Card className="border-red-200 bg-red-50/50 shadow-sm dark:border-red-900 dark:bg-red-950/20">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
            <ShieldOff className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-800 dark:text-red-300">
              Tarjeta de crédito pendiente de activación
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/60">
              Realiza {remaining} compra{remaining !== 1 ? 's' : ''} más con tu tarjeta de débito.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:min-w-[180px]">
          <div className="h-2.5 flex-1 rounded-full bg-red-200 overflow-hidden dark:bg-red-900">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <Badge variant="destructive" className="text-xs font-bold">
            {purchaseCount}/10
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
