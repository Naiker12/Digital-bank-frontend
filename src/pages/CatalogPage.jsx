import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { catalogService } from '@/services/catalogService';
import { cardService } from '@/services/cardService';
import { paymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
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
} from 'lucide-react';
import { toast } from 'sonner';

// ─── UTILIDAD: Normalizar un item del catálogo ────────
// La función normalizeCatalogItem ha sido movida a '@/services/catalogService'

// ─── INSIGNIA DE ESTADO ───────────────────────────────
const STATUS_CONFIG = {
  INITIAL: { label: 'Iniciando', variant: 'secondary' },
  IN_PROGRESS: { label: 'En proceso', variant: 'default' },
  FINISH: { label: 'Completado', variant: 'default' },
  FAILED: { label: 'Fallido', variant: 'destructive' },
};

// ─── SEGUIMIENTO DE PAGO ─────────────────────────────
function PaymentTracker({ status, error, service, onReset }) {
  const steps = [
    { id: 'INITIAL', label: 'Iniciando Pago', progress: 33 },
    { id: 'IN_PROGRESS', label: 'Procesando Transacción', progress: 66 },
    { id: 'FINISH', label: '¡Pago Exitoso!', progress: 100 }
  ];

  const currentStep = steps.find(s => s.id === status) || 
                     (status === 'FAILED' ? steps[1] : steps[0]);
  const progress = status === 'FAILED' ? 100 : currentStep.progress;

  return (
    <div className="space-y-6 p-2 py-6">
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500 shadow-lg",
          status === 'FINISH' ? "bg-emerald-500/20 text-emerald-500 ring-2 ring-emerald-500/20" :
            status === 'FAILED' ? "bg-rose-500/20 text-rose-500 ring-2 ring-rose-500/20" : 
            "bg-primary/20 text-primary ring-2 ring-primary/20"
        )}>
          {status === 'FINISH' ? <CheckCircle2 className="h-8 w-8" /> :
            status === 'FAILED' ? <XCircle className="h-8 w-8" /> :
              <Loader2 className="h-8 w-8 animate-spin" />}
        </div>
        <h3 className="text-xl font-extrabold tracking-tight">
          {status === 'FINISH' ? "¡Transacción Confirmada!" :
            status === 'FAILED' ? "Hubo un problema" : "Operación en Curso"}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
          {status === 'INITIAL' && "Iniciando proceso de pago seguro..."}
          {status === 'IN_PROGRESS' && "Validando fondos y confirmando la transacción con el banco..."}
          {status === 'FINISH' && `Pago a ${service.proveedor} completado con éxito. Se ha generado su comprobante.`}
          {status === 'FAILED' && (error || "La transacción no pudo completarse. Por favor, verifique su saldo o intente más tarde.")}
        </p>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <Progress
          value={progress}
          className={cn("h-1.5 transition-all duration-1000", status === 'FAILED' ? "bg-rose-100" : "bg-primary/10")}
        />
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
          <span className={status === 'INITIAL' || status === 'IN_PROGRESS' || status === 'FINISH' ? "text-primary/70" : ""}>Inicio</span>
          <span className={status === 'IN_PROGRESS' || status === 'FINISH' ? "text-primary/70" : ""}>Procesando</span>
          <span className={status === 'FINISH' ? "text-primary/70" : ""}>Finalizado</span>
        </div>
      </div>

      {(status === 'FINISH' || status === 'FAILED') ? (
        <div className="pt-4">
          <Button 
            className={cn(
              "w-full rounded-xl py-6 font-bold uppercase tracking-widest text-xs",
              status === 'FAILED' ? "bg-rose-500 hover:bg-rose-600" : ""
            )} 
            onClick={onReset}
          >
            Regresar al Catálogo
          </Button>
        </div>
      ) : (
        <div className="pt-4 flex flex-col gap-3">
          <Button 
            variant="outline"
            className="w-full rounded-xl py-6 font-bold uppercase tracking-widest text-xs border-dashed"
            onClick={onReset}
          >
            Cancelar y Reintentar
          </Button>
          <p className="text-[10px] text-center text-muted-foreground animate-pulse">
            Si la operación tarda más de 30s, puedes cancelar y reintentar.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── MODAL DE PAGO ───────────────────────────────────
function PaymentModal({ service, open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [traceId, setTraceId] = useState(null);

  // Cargar tarjetas del usuario desde la API real
  useEffect(() => {
    if (!open || !user?.uuid) return;
    const fetchCards = async () => {
      setLoadingCards(true);
      const result = await cardService.getUserCards(user.uuid);
      if (result.success) {
        setCards(result.data.filter(c => ['ACTIVATED', 'ACTIVE', 'PENDING'].includes(c.status) || !c.status));
      }
      setLoadingCards(false);
    };
    fetchCards();
  }, [open, user?.uuid]);

  // Polling del estado del pago
  useEffect(() => {
    if (!traceId) return;
    const interval = setInterval(async () => {
      const result = await paymentService.getPaymentStatus(traceId);
      if (result.success) {
        const { status, error: apiError } = result;
        setPaymentStatus(status);
        if (apiError) setPaymentError(apiError);

        if (status === 'FINISH' || status === 'FAILED') {
          clearInterval(interval);
          if (status === 'FINISH') {
            toast.success(`Pago a ${service.proveedor} completado`);
          } else {
            toast.error(apiError || 'Pago fallido');
          }
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [traceId, service?.proveedor]);

  const handlePay = async () => {
    if (!selectedCard) return;
    setPaymentStatus('INITIAL');
    setPaymentError(null);

    const result = await paymentService.initiatePayment({
      cardId: selectedCard,
      service: service,
      userId: user?.uuid,
    });

    if (result.success) {
      setTraceId(result.traceId);
    } else {
      setPaymentStatus('FAILED');
      setPaymentError(result.message);
      toast.error(result.message);
    }
  };

  const handleClose = () => {
    // Si el usuario presiona cerrar o cancelar, reseteamos todo para detener el polling
    setPaymentStatus(null);
    setPaymentError(null);
    setSelectedCard(null);
    setTraceId(null);
    onClose();
  };

  // Derivar last4 y balance para cada tarjeta
  const formatCardNumber = (num) => {
    if (!num) return '****';
    return num.slice(-4);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {paymentStatus ? (
          <PaymentTracker
            status={paymentStatus}
            error={paymentError}
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
              {/* Box Gris de Información */}
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

                {loadingCards ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : cards.length === 0 ? (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No tienes tarjetas activas disponibles.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        disabled={card.status === 'PENDING'}
                        onClick={() => setSelectedCard(card.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border p-4 transition-all",
                          card.status === 'PENDING' ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50",
                          selectedCard === card.id
                            ? "border-primary bg-primary/[0.04] ring-1 ring-primary"
                            : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className={cn(
                            "h-10 w-14 rounded-lg flex items-center justify-center transition-all",
                            selectedCard === card.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                          )}>
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">
                              {card.type} <span className="font-medium text-muted-foreground">•••• {formatCardNumber(card.cardNumber)}</span>
                            </p>
                            {card.status === 'PENDING' ? (
                              <div className="mt-1 flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-amber-500 transition-all" 
                                    style={{ width: `${(card.purchaseCount / 10) * 100}%` }} 
                                  />
                                </div>
                                <p className="text-[9px] text-amber-600 font-bold uppercase">
                                  {card.purchaseCount}/10 para activar
                                </p>
                              </div>
                            ) : (
                              <p className="text-[10px] text-muted-foreground font-medium">
                                Disponible: <span className="font-bold text-foreground">${parseFloat(card.balance || 0).toLocaleString()}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                          selectedCard === card.id ? "border-primary bg-primary" : "border-slate-200"
                        )}>
                          {selectedCard === card.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cargar catálogo desde la API real
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      const result = await catalogService.getCatalog();
      if (result.success) {
        setCatalog(result.data);
      } else {
        toast.error(result.message);
        setCatalog([]);
      }
      setLoading(false);
    };
    fetchCatalog();
  }, []);

  const categories = ['all', ...new Set(catalog.map(s => s.categoria))];

  const filtered = catalog.filter((s) => {
    const matchesSearch = 
      (s.servicio?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (s.proveedor?.toLowerCase() ?? "").includes(search.toLowerCase());
    
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
      <div className="flex flex-col gap-1 px-2 md:px-0">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Servicios y Pagos</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Gestiona y paga tus facturas de servicios públicos de forma centralizada.
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2 md:px-0">
        <Tabs defaultValue="all" value={category} onValueChange={handleCategoryChange} className="w-full md:w-auto">
          <TabsList className="bg-muted/50 p-1 h-12 w-full flex overflow-x-auto justify-start scrollbar-hide flex-nowrap border border-border/50">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="rounded-lg px-5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap transition-all"
              >
                {cat === 'all' ? 'Todos' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative w-full md:max-w-xs group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por nombre o proveedor..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-12 pl-11 rounded-xl bg-background border-border/80 focus-visible:ring-primary shadow-sm"
          />
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Estado de Carga */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Cargando catálogo de servicios...</p>
        </div>
      ) : (
        <>
          {/* Contenedor de Servicios */}
          <Card className="border-none shadow-sm overflow-hidden w-full max-w-full bg-transparent md:bg-card">
            <CardContent className="p-0">
              
              {/* Vista Móvil (Tarjetas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden py-4 px-2">
                {paginatedItems.map((s) => (
                  <div key={s.id} className="flex flex-col gap-4 rounded-2xl border border-border/60 p-5 shadow-sm bg-card hover:border-primary/30 transition-all">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider border-none px-2.5">
                        {s.categoria}
                      </Badge>
                      <div className="text-right">
                        <p className="font-black text-xl text-slate-900 dark:text-white leading-none">
                          {s.precio_mensual.toFixed(2)}
                        </p>
                        <span className="text-[10px] font-bold opacity-30 tracking-widest uppercase">us$ / mes</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">{s.proveedor}</h3>
                      <p className="text-muted-foreground text-sm font-medium">{s.servicio}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                      <p className="text-[11px] font-semibold opacity-50 uppercase tracking-wider">Plan {s.plan}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-border/40">
                      <Badge
                        className={cn(
                          "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-none shadow-none",
                          s.estado === 'Activo' ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                        )}
                      >
                        {s.estado}
                      </Badge>
                      <Button
                        size="sm"
                        className="rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/10 px-4 h-9"
                        disabled={s.estado !== 'Activo'}
                        onClick={() => setSelected(s)}
                      >
                        Pagar Factura
                      </Button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground font-medium sm:col-span-2 bg-card rounded-2xl border border-dashed">
                    No se encontraron servicios que coincidan con tu búsqueda
                  </div>
                )}
              </div>

              {/* Vista Escritorio (Tabla) */}
              <div className="hidden md:block overflow-x-auto w-full">
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
                    {paginatedItems.map((s) => (
                      <TableRow key={s.id} className="group hover:bg-muted/30 border-muted/20">
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                            {s.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">{s.proveedor}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-medium">{s.servicio}</TableCell>
                        <TableCell className="hidden lg:table-cell text-[10px] font-semibold opacity-40 uppercase tracking-tight">
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
        </>
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
