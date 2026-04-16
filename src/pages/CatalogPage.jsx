import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MOCK_CATALOG, MOCK_CARDS } from '@/data/mockData';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  CreditCard,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── INSIGNIA DE ESTADO ───────────────────────────────
const STATUS_CONFIG = {
  INITIAL: { label: 'Iniciando', variant: 'secondary' },
  IN_PROGRESS: { label: 'En proceso', variant: 'default' },
  FINISH: { label: 'Completado', variant: 'default' },
  FAILED: { label: 'Fallido', variant: 'destructive' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.INITIAL;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

// ─── SEGUIMIENTO DE PAGO ─────────────────────────────
function PaymentTracker({ status, service, onReset }) {
  const steps = [
    { id: 'INITIAL', label: 'Validando Datos', progress: 33 },
    { id: 'IN_PROGRESS', label: 'Procesando en Red', progress: 66 },
    { id: 'FINISH', label: 'Completado', progress: 100 }
  ];

  const currentStep = steps.find(s => s.id === status) || steps[0];
  const progress = status === 'FAILED' ? 100 : currentStep.progress;

  return (
    <div className="space-y-6 p-2 py-6">
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500",
          status === 'FINISH' ? "bg-emerald-500/20 text-emerald-500" :
            status === 'FAILED' ? "bg-red-500/20 text-red-500" : "bg-primary/20 text-primary"
        )}>
          {status === 'FINISH' ? <CheckCircle2 className="h-8 w-8" /> :
            status === 'FAILED' ? <XCircle className="h-8 w-8" /> :
              <Loader2 className="h-8 w-8 animate-spin" />}
        </div>
        <h3 className="text-xl font-bold tracking-tight">
          {status === 'FINISH' ? "¡Pago Exitoso!" :
            status === 'FAILED' ? "Pago Fallido" : "Procesando Transacción"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[280px]">
          {status === 'INITIAL' && "Estamos validando tu tarjeta y saldo disponible..."}
          {status === 'IN_PROGRESS' && "Comunicando con el procesador de pagos bancario..."}
          {status === 'FINISH' && `El pago de ${service.precio_mensual} US$ a ${service.proveedor} se ha realizado correctamente.`}
          {status === 'FAILED' && "No se pudo completar el pago. Revisa tu saldo e intenta nuevamente."}
        </p>
      </div>

      <div className="space-y-3 px-4">
        <Progress
          value={progress}
          className={cn("h-2 transition-all duration-700", status === 'FAILED' ? "bg-red-200" : "bg-primary/10")}
        />
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          <span className={status === 'INITIAL' || status === 'IN_PROGRESS' || status === 'FINISH' ? "text-primary transition-colors" : ""}>Validación</span>
          <span className={status === 'IN_PROGRESS' || status === 'FINISH' ? "text-primary transition-colors" : ""}>Procesamiento</span>
          <span className={status === 'FINISH' ? "text-primary transition-colors" : ""}>Finalización</span>
        </div>
      </div>

      {(status === 'FINISH' || status === 'FAILED') && (
        <div className="pt-2">
          <Button className="w-full rounded-xl py-6 font-bold" onClick={onReset}>
            Entendido
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── MODAL DE PAGO ───────────────────────────────────
function PaymentModal({ service, open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const cards = MOCK_CARDS.filter(
    (c) => c.user_id === user?.uuid && c.status === 'ACTIVE'
  );
  const [selectedCard, setSelectedCard] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const handlePay = () => {
    if (!selectedCard) return;
    setPaymentStatus('INITIAL');

    // Simular el proceso de 3 pasos (Lambda pipeline)
    setTimeout(() => setPaymentStatus('IN_PROGRESS'), 1500);
    setTimeout(() => {
      const card = cards.find((c) => c.uuid === selectedCard);
      if (card && card.balance >= service.precio_mensual) {
        setPaymentStatus('FINISH');
        toast.success(`Pago a ${service.proveedor} completado`);
      } else {
        setPaymentStatus('FAILED');
        toast.error('Saldo insuficiente');
      }
    }, 4000);
  };

  const handleClose = () => {
    if (paymentStatus === 'INITIAL' || paymentStatus === 'IN_PROGRESS') return;
    setPaymentStatus(null);
    setSelectedCard(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {paymentStatus ? (
          <PaymentTracker
            status={paymentStatus}
            service={service}
            onReset={handleClose}
          />
        ) : (
          <div className="space-y-6 pt-2">
            <DialogHeader>
              <DialogTitle>Confirmar pago de servicio</DialogTitle>
              <DialogDescription className="sr-only">
                Detalles del servicio y selección de método de pago.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Box Gris de Información (Mismo estilo que CardsPage) */}
              <div className="rounded-lg bg-muted p-6 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total a pagar</p>
                <p className="text-4xl font-bold">
                  {service.precio_mensual.toFixed(2)} <span className="text-xl opacity-40">US$</span>
                </p>
                <p className="mt-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {service.proveedor} — {service.servicio}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Medio de Pago
                  </span>
                  <span className="text-[10px] font-bold text-primary uppercase">
                    Seguro SSL
                  </span>
                </div>

                <div className="space-y-3">
                  {cards.map((card) => (
                    <button
                      key={card.uuid}
                      type="button"
                      onClick={() => setSelectedCard(card.uuid)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border p-4 transition-all",
                        selectedCard === card.uuid
                          ? "border-primary bg-primary/[0.04] ring-1 ring-primary"
                          : "border-slate-100 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={cn(
                          "h-10 w-14 rounded-lg flex items-center justify-center transition-all",
                          selectedCard === card.uuid ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        )}>
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">
                            {card.type} <span className="font-medium text-muted-foreground">•••• {card.last4}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            Disponible: <span className="font-bold text-foreground">${card.balance.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>

                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                        selectedCard === card.uuid ? "border-primary bg-primary" : "border-slate-200"
                      )}>
                        {selectedCard === card.uuid && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  className="w-full rounded-xl py-6 font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20"
                  disabled={!selectedCard}
                  onClick={handlePay}
                >
                  Confirmar y Pagar
                </Button>

                <div className="flex flex-col items-center gap-3 pt-1">
                  <p className="text-[9px] text-center text-muted-foreground font-medium leading-relaxed px-6">
                    Al confirmar, autorizas a <span className="font-bold text-foreground">Digital Bank</span> a debitar el monto especificado.
                  </p>
                  <div className="bg-muted/50 px-3 py-1 rounded-full border border-border">
                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Powered by Naiker Cloud</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── PÁGINA DEL CATÁLOGO ─────────────────────────────
export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const categories = ['all', ...new Set(MOCK_CATALOG.map(s => s.categoria))];

  const filtered = MOCK_CATALOG.filter((s) => {
    const matchesSearch = 
      s.servicio.toLowerCase().includes(search.toLowerCase()) ||
      s.proveedor.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = category === 'all' || s.categoria === category;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page on filter change
  const handleCategoryChange = (val) => {
    setCategory(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 pb-10 font-sans">
      {/* Cabecera Limpia (Shadcn Style) */}
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-bold tracking-tight">Servicios y Pagos</h1>
        <p className="text-muted-foreground text-sm">
          Gestiona y paga tus facturas de servicios públicos de forma centralizada.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1 overflow-hidden">
        <Tabs defaultValue="all" value={category} onValueChange={handleCategoryChange} className="w-full md:w-auto max-w-full">
          <TabsList className="bg-muted/50 p-1 h-11 w-full flex overflow-x-auto justify-start no-scrollbar">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="rounded-lg px-4 text-xs font-semibold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap"
              >
                {cat === 'all' ? 'Todos' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full max-w-xs group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por nombre o proveedor..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-11 pl-10 rounded-xl bg-background border-border focus-visible:ring-primary"
          />
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Tabla */}
      <Card className="border-none shadow-sm overflow-hidden w-full max-w-full">
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-muted/30">
                <TableRow className="border-muted hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Categoría</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Proveedor</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Servicio</TableHead>
                  <TableHead className="hidden lg:table-cell text-[10px] font-bold uppercase tracking-widest py-5">Plan</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest py-5">Precio Mensual</TableHead>
                  <TableHead className="hidden xl:table-cell text-[10px] font-bold uppercase tracking-widest py-5">Detalles</TableHead>
                  <TableHead className="hidden sm:table-cell text-center text-[10px] font-bold uppercase tracking-widest py-5">Estado</TableHead>
                  <TableHead className="text-right py-5"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((s, i) => (
                  <TableRow key={s.id} className="group hover:bg-muted/30 border-muted/20">
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                        {s.categoria}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">{s.proveedor}</TableCell>
                    <TableCell className="text-muted-foreground text-xs font-medium">{s.servicio}</TableCell>
                    <TableCell className="hidden lg:table-cell text-[10px] font-semibold italic opacity-40 uppercase tracking-tight">
                      {s.plan}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-white">
                      {s.precio_mensual.toFixed(2)} <span className="text-[9px] font-bold opacity-30 tracking-widest">US$</span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-[10px] font-medium leading-relaxed max-w-[180px] truncate opacity-40">
                      {s.detalles}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-center">
                      <div className="flex justify-center">
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] border-none shadow-none",
                            s.estado === 'Activo' ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                          )}
                        >
                          {s.estado}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 transition-all hover:translate-y-[-1px] active:scale-95"
                        disabled={s.estado !== 'Activo'}
                        onClick={() => setSelected(s)}
                      >
                        Pagar Factura
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground font-medium">
                      No se encontraron servicios que coincidan con tu búsqueda
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i + 1} className="hidden sm:inline-block">
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Modal de pago */}
      {selected && (
        <PaymentModal
          service={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
