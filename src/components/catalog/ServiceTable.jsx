import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Tabla responsiva del catálogo de servicios.
 * Vista móvil: tarjetas apiladas.  Vista desktop: tabla formal.
 */
export default function ServiceTable({ items, emptyCount, onSelect }) {
  const isEmpty = emptyCount === 0;

  return (
    <Card className="border-none shadow-sm overflow-hidden w-full max-w-full bg-transparent md:bg-card">
      <CardContent className="p-0">
        {/* Vista Móvil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden py-4 px-2">
          {items.map((s) => (
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
                    'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-none shadow-none',
                    s.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'
                  )}
                >
                  {s.estado}
                </Badge>
                <Button
                  size="sm"
                  className="rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-primary/10 px-4 h-9"
                  disabled={s.estado !== 'Activo'}
                  onClick={() => onSelect(s)}
                >
                  Pagar Factura
                </Button>
              </div>
            </div>
          ))}
          {isEmpty && (
            <div className="text-center py-12 text-muted-foreground font-medium sm:col-span-2 bg-card rounded-2xl border border-dashed">
              No se encontraron servicios que coincidan con tu búsqueda
            </div>
          )}
        </div>

        {/* Vista Desktop */}
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
                <TableHead className="text-right py-5" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id} className="group hover:bg-muted/30 border-muted/20">
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                      {s.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">{s.proveedor}</TableCell>
                  <TableCell className="text-muted-foreground text-xs font-medium">{s.servicio}</TableCell>
                  <TableCell className="hidden lg:table-cell text-[10px] font-semibold opacity-40 uppercase tracking-tight">{s.plan}</TableCell>
                  <TableCell className="font-bold text-slate-900 dark:text-white">
                    {s.precio_mensual.toFixed(2)} <span className="text-[9px] font-bold opacity-30 tracking-widest">US$</span>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-[10px] font-medium leading-relaxed max-w-[180px] truncate opacity-40">{s.detalles}</TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    <div className="flex justify-center">
                      <Badge
                        className={cn(
                          'rounded-full px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] border-none shadow-none',
                          s.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-500/10 text-slate-500'
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
                      onClick={() => onSelect(s)}
                    >
                      Pagar Factura
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {isEmpty && (
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
  );
}
