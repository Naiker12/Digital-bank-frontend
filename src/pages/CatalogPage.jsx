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
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    <div className="space-y-5 overflow-x-hidden pb-10 font-sans sm:space-y-6">

      <div className="flex flex-col gap-1 px-2 sm:px-3 md:px-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Servicios y Pagos</h1>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Gestiona y paga tus facturas de servicios públicos de forma centralizada.
        </p>
      </div>

      <div className="px-2 sm:px-3 md:px-0">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm backdrop-blur-sm md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-0">
          <div className="space-y-3 md:hidden">
            <div className="group relative w-full min-w-0">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Buscar por nombre o proveedor..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-12 rounded-xl border-border/80 bg-background pl-11 shadow-sm focus-visible:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-11 w-full items-center justify-between rounded-xl border border-border/80 bg-background px-4 text-sm font-medium text-foreground shadow-sm"
                  >
                    <span className="truncate">
                      {category === 'all' ? 'Todas las categorías' : category}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                  {categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat}
                      onSelect={() => handleCategoryChange(cat)}
                      className="cursor-pointer"
                    >
                      {cat === 'all' ? 'Todos' : cat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="hidden min-w-0 flex-col gap-3 md:flex md:flex-row md:items-center md:justify-between">
            <Tabs defaultValue="all" value={category} onValueChange={handleCategoryChange} className="w-full min-w-0 md:w-auto">
              <TabsList className="bg-muted/50 h-11 w-full min-w-0 flex flex-nowrap justify-start border border-border/50 p-1 scrollbar-hide sm:overflow-x-auto sm:overscroll-x-contain">
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="w-auto shrink-0 whitespace-nowrap rounded-lg px-5 text-[10px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="group relative w-full min-w-0 md:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Buscar por nombre o proveedor..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-12 rounded-xl border-border/80 bg-background pl-11 shadow-sm focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

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
