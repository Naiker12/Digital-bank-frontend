import { useState, useEffect } from 'react';
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
  Loader2
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
  { name: 'Ene', ingresos: 0, gastos: 0 },
  { name: 'Feb', ingresos: 0, gastos: 0 },
  { name: 'Mar', ingresos: 0, gastos: 0 },
  { name: 'Abr', ingresos: 0, gastos: 0 },
  { name: 'May', ingresos: 0, gastos: 0 },
  { name: 'Jun', ingresos: 0, gastos: 0 },
  { name: 'Jul', ingresos: 0, gastos: 0 },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentTx] = useState([]); // Placeholder para futuras transacciones reales

  useEffect(() => {
    if (!user?.uuid) return;
    
    const fetchData = async () => {
      setLoading(true);
      const result = await cardService.getUserCards(user.uuid);
      if (result.success) {
        setCards(result.data.filter(c => ['ACTIVATED', 'ACTIVE', 'PENDING'].includes(c.status) || !c.status));
      }
      setLoading(false);
    };

    fetchData();
  }, [user?.uuid]);

  const totalBalance = cards.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0);

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
              Hola, {user?.name || 'Usuario'} 👋
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Disponible", value: `${totalBalance.toFixed(2)} US$`, icon: Wallet, color: "text-primary", bg: "bg-primary/5", desc: `${cards.length} tarjetas activas` },
              { title: "Tarjetas", value: cards.length.toString(), icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/5", desc: "Total gestionado" },
              { title: "Ingresos (Mes)", value: "0.00 US$", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/5", desc: "No hay datos" },
              { title: "Gastos (Mes)", value: "0.00 US$", icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/5", desc: "No hay datos" }
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
                  <p className="text-xs text-muted-foreground">Resumen dinámico de actividad</p>
                </div>
                <Badge variant="outline" className="font-mono">2026</Badge>
              </CardHeader>
              <CardContent>
                <div className="h-[350px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px' }}
                      />
                      <Area type="monotone" dataKey="ingresos" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
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
                  <p className="text-xs text-muted-foreground">Actividad reciente</p>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">Ver todo</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTx.length > 0 ? (
                  recentTx.map((tx) => (
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
                          <p className="text-[11px] text-muted-foreground uppercase font-medium">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-bold", tx.amount > 0 ? "text-emerald-600" : "text-red-500")}>
                          {tx.amount > 0 ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-muted-foreground opacity-20" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sin actividad reciente</p>
                      <p className="text-xs text-muted-foreground px-6 mt-1">
                        Las transacciones asíncronas aparecerán aquí una vez que hayan sido procesadas.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-bold uppercase tracking-widest h-9" asChild>
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
