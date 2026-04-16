import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { MOCK_CARDS, MOCK_TRANSACTIONS } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const chartData = [
  { name: 'Ene', ingresos: 4000, gastos: 2400 },
  { name: 'Feb', ingresos: 3000, gastos: 1398 },
  { name: 'Mar', ingresos: 2000, gastos: 9800 },
  { name: 'Abr', ingresos: 2780, gastos: 3908 },
  { name: 'May', ingresos: 1890, gastos: 4800 },
  { name: 'Jun', ingresos: 2390, gastos: 3800 },
  { name: 'Jul', ingresos: 3490, gastos: 4300 },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const cards = MOCK_CARDS.filter((c) => c.user_id === user?.uuid);
  const totalBalance = cards
    .filter((c) => c.status === 'ACTIVE')
    .reduce((sum, c) => sum + c.balance, 0);

  const recentTx = MOCK_TRANSACTIONS.slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      {/* Cabecera Premium */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-mesh-pattern opacity-20" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hola, {user?.name} 👋
            </h1>
            <p className="mt-1 text-slate-400">
              Bienvenido de nuevo. Aquí tienes un resumen de tus finanzas hoy.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Saldo Total</p>
              <p className="text-xl font-bold">{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} US$</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas con micro-animaciones */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Disponible", value: `${totalBalance.toFixed(2)} US$`, icon: Wallet, color: "text-primary", bg: "bg-primary/5", desc: `${cards.filter(c => c.status === 'ACTIVE').length} tarjetas activas` },
          { title: "Tarjetas", value: cards.length.toString(), icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/5", desc: `${cards.filter(c => c.status === 'PENDING').length} por activar` },
          { title: "Ingresos (Mes)", value: `+${MOCK_TRANSACTIONS.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toFixed(2)} US$`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/5", desc: "Tendencia positiva" },
          { title: "Gastos (Mes)", value: `-${Math.abs(MOCK_TRANSACTIONS.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)).toFixed(2)} US$`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/5", desc: "Ahorro vs mes anterior" }
        ].map((stat, i) => (
          <Card key={i} className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg transition-colors group-hover:bg-opacity-20", stat.bg, stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <p className={cn("text-2xl font-bold tracking-tight", i >= 2 && stat.color)}>
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Gráfico Principal */}
        <Card className="lg:col-span-4 border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Flujo Mensual</CardTitle>
              <p className="text-xs text-muted-foreground">Comparativa de ingresos y gastos</p>
            </div>
            <Badge variant="outline" className="font-mono">2024</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full pt-4 min-h-0 min-w-0">
              <ResponsiveContainer width={undefined} height={350} minWidth={1} minHeight={1} aspect={undefined}>
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="ingresos" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
                  <Area type="monotone" dataKey="gastos" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorGastos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transacciones Recientes */}
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Movimientos</CardTitle>
              <p className="text-xs text-muted-foreground">Últimas actividades</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">Ver todo</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTx.map((tx) => (
              <div key={tx.id} className="group flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110",
                    tx.amount > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                  )}>
                    {tx.amount > 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight">{tx.description}</p>
                    <p className="text-[11px] text-muted-foreground uppercase font-medium">{tx.date} · {tx.type}</p>
                  </div>
                </div>
                  <div className="text-right">
                    <p className={cn("text-sm font-bold", tx.amount > 0 ? "text-emerald-600" : "text-red-500")}>
                      {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Pagado</p>
                  </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
