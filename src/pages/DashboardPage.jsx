import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { cardService } from '@/services/cardService';
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
  Loader2,
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

const CURRENT_YEAR = 2026;
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const createEmptyChart = () => MONTH_LABELS.map((name) => ({ name, ingresos: 0, gastos: 0 }));

const formatMoney = (value) => `${Number(value || 0).toFixed(2)} US$`;

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [cards, setCards] = useState([]);
  const [recentTx, setRecentTx] = useState([]);
  const [chartData, setChartData] = useState(createEmptyChart);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uuid) return;

    const fetchData = async () => {
      setLoading(true);

      const result = await cardService.getUserCards(user.uuid);
      if (!result.success) {
        setCards([]);
        setRecentTx([]);
        setChartData(createEmptyChart());
        setMonthlyIncome(0);
        setMonthlyExpenses(0);
        setLoading(false);
        return;
      }

      const activeCards = result.data.filter((card) => ['ACTIVATED', 'ACTIVE', 'PENDING'].includes(card.status) || !card.status);
      setCards(activeCards);

      const reports = await Promise.all(activeCards.map((card) => cardService.getCardReport(card.uuid || card.id)));
      const transactions = reports
        .filter((report) => report.success)
        .flatMap((report) => report.data.transactions || [])
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      const nextChart = createEmptyChart();
      let nextMonthlyIncome = 0;
      let nextMonthlyExpenses = 0;

      transactions.forEach((transaction) => {
        if (!transaction.rawDate || transaction.year !== CURRENT_YEAR) {
          return;
        }

        const monthIndex = transaction.rawDate.getMonth();
        if (transaction.isIncome) {
          nextChart[monthIndex].ingresos += transaction.amount;
          nextMonthlyIncome += transaction.rawDate.getMonth() === new Date().getMonth() ? transaction.amount : 0;
        }

        if (transaction.isExpense) {
          nextChart[monthIndex].gastos += transaction.amount;
          nextMonthlyExpenses += transaction.rawDate.getMonth() === new Date().getMonth() ? transaction.amount : 0;
        }
      });

      setChartData(nextChart);
      setMonthlyIncome(nextMonthlyIncome);
      setMonthlyExpenses(nextMonthlyExpenses);
      setRecentTx(transactions.slice(0, 6));
      setLoading(false);
    };

    fetchData();
  }, [user?.uuid]);

  const totalBalance = useMemo(
    () => cards.reduce((sum, card) => sum + parseFloat(card.balance || 0), 0),
    [cards]
  );

  const stats = [
    {
      title: 'Disponible',
      value: formatMoney(totalBalance),
      icon: Wallet,
      color: 'text-primary',
      bg: 'bg-primary/5',
      desc: `${cards.length} tarjetas activas`,
    },
    {
      title: 'Tarjetas',
      value: cards.length.toString(),
      icon: CreditCard,
      color: 'text-blue-500',
      bg: 'bg-blue-500/5',
      desc: 'Total gestionado',
    },
    {
      title: 'Ingresos (Mes)',
      value: formatMoney(monthlyIncome),
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/5',
      desc: monthlyIncome > 0 ? 'Recargas y pagos aplicados' : 'Sin ingresos este mes',
    },
    {
      title: 'Gastos (Mes)',
      value: formatMoney(monthlyExpenses),
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-500/5',
      desc: monthlyExpenses > 0 ? 'Compras registradas' : 'Sin gastos este mes',
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-mesh-pattern opacity-20" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Hola, {user?.name || 'Usuario'} 👋
            </h1>
            <p className="mt-1 text-slate-400">
              Bienvenido de nuevo. Aquí tienes un resumen real de tu actividad financiera.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Saldo Total</p>
              <p className="text-xl font-bold">{formatMoney(totalBalance)}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="group overflow-hidden border-none shadow-sm transition-all hover:-translate-y-[2px] hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition-colors group-hover:bg-opacity-20', stat.bg, stat.color)}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className={cn('text-2xl font-bold tracking-tight', stat.color)}>
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
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                      <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
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

            <Card className="border-none shadow-sm lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Movimientos</CardTitle>
                  <p className="text-xs text-muted-foreground">Actividad reciente</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Ver todo</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTx.length > 0 ? (
                  recentTx.map((transaction) => (
                    <div key={transaction.id} className="group flex items-center justify-between rounded-xl p-2 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110',
                          transaction.isIncome ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                        )}>
                          {transaction.isIncome ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold tracking-tight">{transaction.description}</p>
                          <p className="text-[11px] font-medium uppercase text-muted-foreground">
                            {transaction.date} • {transaction.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-sm font-bold', transaction.isIncome ? 'text-emerald-600' : 'text-red-500')}>
                          {transaction.isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                      <TrendingUp className="h-8 w-8 text-muted-foreground opacity-20" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sin actividad reciente</p>
                      <p className="mt-1 px-6 text-xs text-muted-foreground">
                        Tus compras, recargas y pagos aparecerán aquí cuando se registren en la tarjeta.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="h-9 rounded-xl text-[10px] font-bold uppercase tracking-widest" asChild>
                      <a href="/catalog">Explorar Catálogo</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
