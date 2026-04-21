import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const CURRENT_YEAR = 2026;

/**
 * Gráfica de área que muestra el flujo financiero mensual
 * (ingresos vs gastos) del año actual.
 */
export default function MonthlyChart({ data }) {
  return (
    <Card className="min-w-0 overflow-hidden border-none shadow-sm lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Flujo Mensual</CardTitle>
          <p className="text-xs text-muted-foreground">Ingresos y gastos de tus tarjetas</p>
        </div>
        <Badge variant="outline" className="font-mono">{CURRENT_YEAR}</Badge>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="h-[350px] min-w-0 w-full pt-4">
          <ResponsiveContainer width="100%" height={320} minWidth={0}>
            <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.5} vertical={false} />
              <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                formatter={(value, name) => [`$${Number(value || 0).toFixed(2)}`, name === 'ingresos' ? 'Ingresos' : 'Gastos']}
              />
              <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
              <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGastos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
