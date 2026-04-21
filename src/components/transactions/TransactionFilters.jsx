import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const TYPE_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'PURCHASE', label: 'Compras' },
  { value: 'SAVING', label: 'Recargas' },
  { value: 'PAYMENT_BALANCE', label: 'Pagos' },
];

/**
 * Tabs de filtro por tipo de transacción con contador de resultados.
 */
export default function TransactionFilters({ value, onChange, resultCount }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Tabs value={value} onValueChange={onChange}>
        <TabsList className="bg-muted/50 border border-border/50 h-11">
          {TYPE_FILTERS.map((filter) => (
            <TabsTrigger
              key={filter.value}
              value={filter.value}
              className="rounded-lg px-5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Mostrando{' '}
        <span className="font-bold text-foreground">{resultCount}</span>{' '}
        movimiento{resultCount !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
