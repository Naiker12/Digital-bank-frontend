import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { cardService, getDebitPurchaseCount } from '@/services/cardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Loader2,
} from 'lucide-react';

import StatsGrid from '@/components/transactions/StatsGrid';
import TransactionItem from '@/components/transactions/TransactionItem';
import CreditActivationAlert from '@/components/dashboard/CreditActivationAlert';
import MonthlyChart from '@/components/dashboard/MonthlyChart';

const CURRENT_YEAR = 2026;
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MAX_RECENT_TRANSACTIONS = 5;

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
  const [purchaseCount, setPurchaseCount] = useState(null);

  const hasCreditCard = useMemo(
    () => cards.some((card) => card.type === 'CREDIT'),
    [cards]
  );
  const creditNeedsActivation = hasCreditCard && purchaseCount !== null && purchaseCount < 10;

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

      const activeCards = result.data.filter(
        (card) => ['ACTIVATED', 'ACTIVE', 'PENDING'].includes(card.status) || !card.status
      );
      setCards(activeCards);

      const reports = await Promise.all(
        activeCards.map((card) => cardService.getCardReport(card.uuid || card.id))
      );
      const transactions = reports
        .filter((report) => report.success)
        .flatMap((report) => report.data.transactions || [])
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      const nextChart = createEmptyChart();
      let nextMonthlyIncome = 0;
      let nextMonthlyExpenses = 0;

      transactions.forEach((tx) => {
        if (!tx.rawDate || tx.year !== CURRENT_YEAR) return;

        const monthIndex = tx.rawDate.getMonth();
        const isCurrentMonth = tx.rawDate.getMonth() === new Date().getMonth();

        if (tx.isIncome) {
          nextChart[monthIndex].ingresos += tx.amount;
          if (isCurrentMonth) nextMonthlyIncome += tx.amount;
        }
        if (tx.isExpense) {
          nextChart[monthIndex].gastos += tx.amount;
          if (isCurrentMonth) nextMonthlyExpenses += tx.amount;
        }
      });

      setChartData(nextChart);
      setMonthlyIncome(nextMonthlyIncome);
      setMonthlyExpenses(nextMonthlyExpenses);
      setRecentTx(transactions.slice(0, MAX_RECENT_TRANSACTIONS));
      setLoading(false);
    };

    fetchData();
  }, [user?.uuid]);

  useEffect(() => {
    if (!user?.uuid) return;

    if (!hasCreditCard) {
      setPurchaseCount(null);
      return;
    }

    let cancelled = false;

    getDebitPurchaseCount(user.uuid, cards).then((count) => {
      if (!cancelled) {
        setPurchaseCount(count);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasCreditCard, cards, user?.uuid]);

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
          <StatsGrid stats={stats} />

          {creditNeedsActivation && (
            <CreditActivationAlert purchaseCount={purchaseCount} />
          )}

          <div className="grid gap-6 lg:grid-cols-7">
            <MonthlyChart data={chartData} />

            <Card className="border-none shadow-sm lg:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Movimientos</CardTitle>
                  <p className="text-xs text-muted-foreground">Actividad reciente</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs font-bold text-primary" asChild>
                  <Link to="/transactions">Ver todo</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTx.length > 0 ? (
                  recentTx.map((tx) => (
                    <TransactionItem key={tx.id} transaction={tx} />
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
