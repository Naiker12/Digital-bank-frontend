import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { catalogService } from '@/services/catalogService';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/* ── Componentes extraídos ──── */
import ServiceTable from '@/components/catalog/ServiceTable';
import PaymentModal from '@/components/catalog/PaymentModal';

const ITEMS_PER_PAGE = 10;

export default function CatalogPage() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Carga del catálogo ──── */
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

  /* ── Filtrado y paginación ──── */
  const categories = ['all', ...new Set(catalog.map((s) => s.categoria))];

  const filtered = catalog.filter((s) => {
    const matchesSearch =
      (s.servicio?.toLowerCase() ?? '').includes(search.toLowerCase()) ||
      (s.proveedor?.toLowerCase() ?? '').includes(search.toLowerCase());
    const matchesCategory = category === 'all' || s.categoria === category;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
      {/* ── Header ─── */}
      <div className="flex flex-col gap-1 px-2 md:px-0">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Servicios y Pagos</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Gestiona y paga tus facturas de servicios públicos de forma centralizada.
        </p>
      </div>

      {/* ── Filtros ─── */}
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

      {/* ── Contenido ─── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Cargando catálogo de servicios...</p>
        </div>
      ) : (
        <>
          <ServiceTable
            items={paginatedItems}
            emptyCount={filtered.length}
            onSelect={setSelected}
          />

          {/* ── Paginación ─── */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn('cursor-pointer', currentPage === 1 && 'pointer-events-none opacity-50')}
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={cn('cursor-pointer', currentPage === totalPages && 'pointer-events-none opacity-50')}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* ── Modal de pago ─── */}
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
