import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { cardService } from '@/services/cardService';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  ArrowLeft,
  Loader2,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
  Hash,
} from 'lucide-react';

import StatsGrid from '@/components/transactions/StatsGrid';
import TransactionTable from '@/components/transactions/TransactionTable';
import TransactionFilters from '@/components/transactions/TransactionFilters';
import TransactionDetailModal from '@/components/transactions/TransactionDetailModal';

const ITEMS_PER_PAGE = 8;

export default function TransactionsPage() {
  const user = useAuthStore((s) => s.user);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.uuid) return;

    const fetchAllTransactions = async () => {
      setLoading(true);

      const cardsResult = await cardService.getUserCards(user.uuid);
      if (!cardsResult.success) {
        setAllTransactions([]);
        setLoading(false);
        return;
      }

      const activeCards = cardsResult.data.filter(
        (card) => ['ACTIVATED', 'ACTIVE', 'PENDING'].includes(card.status) || !card.status
      );

      const reports = await Promise.all(
        activeCards.map((card) => cardService.getCardReport(card.uuid || card.id))
      );

      const transactions = reports
        .filter((report) => report.success)
        .flatMap((report) => report.data.transactions || [])
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      setAllTransactions(transactions);
      setLoading(false);
    };

    fetchAllTransactions();
  }, [user?.uuid]);

  const totals = useMemo(() => {
    let totalExpenses = 0;
    let totalIncome = 0;

    allTransactions.forEach((tx) => {
      if (tx.isExpense) totalExpenses += tx.amount;
      if (tx.isIncome) totalIncome += tx.amount;
    });

    return {
      expenses: totalExpenses,
      income: totalIncome,
      net: totalIncome - totalExpenses,
      count: allTransactions.length,
    };
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    if (typeFilter === 'all') return allTransactions;
    return allTransactions.filter((tx) => tx.type === typeFilter);
  }, [allTransactions, typeFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleSelectTransaction = (tx) => {
    setSelectedTx(tx);
    setModalOpen(true);
  };

  const statsCards = [
    {
      title: 'Total Gastado',
      value: `${totals.expenses.toFixed(2)} US$`,
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-500/5',
    },
    {
      title: 'Total Ingresado',
      value: `${totals.income.toFixed(2)} US$`,
      icon: TrendingUp,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/5',
    },
    {
      title: 'Balance Neto',
      value: `${totals.net.toFixed(2)} US$`,
      icon: Wallet,
      color: totals.net >= 0 ? 'text-emerald-500' : 'text-red-500',
      bg: totals.net >= 0 ? 'bg-emerald-500/5' : 'bg-red-500/5',
    },
    {
      title: 'Movimientos',
      value: totals.count.toString(),
      icon: Hash,
      color: 'text-blue-500',
      bg: 'bg-blue-500/5',
    },
  ];

  return (
    <div className="space-y-8 pb-10">

      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-mesh-pattern opacity-20" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl text-white hover:bg-white/10"
              asChild
            >
              <Link to="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Historial de Movimientos</h1>
              <p className="mt-1 text-slate-400">
                Todas las transacciones registradas en tus tarjetas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total</p>
              <p className="text-xl font-bold">{totals.count} movimientos</p>
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
          <StatsGrid stats={statsCards} />

          <TransactionFilters
            value={typeFilter}
            onChange={handleFilterChange}
            resultCount={filteredTransactions.length}
          />

          <TransactionTable
            transactions={paginatedTransactions}
            onSelectTransaction={handleSelectTransaction}
          />

          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 pt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                Página <span className="text-primary">{currentPage}</span> de {totalPages}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(
                        'cursor-pointer rounded-xl border-none hover:bg-primary/10 transition-all',
                        currentPage === 1 && 'pointer-events-none opacity-20'
                      )}
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i + 1} className="hidden sm:inline-block">
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={cn(
                          'cursor-pointer rounded-xl border-none font-bold transition-all',
                          currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary hover:text-white' : 'hover:bg-primary/10'
                        )}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={cn(
                        'cursor-pointer rounded-xl border-none hover:bg-primary/10 transition-all',
                        currentPage === totalPages && 'pointer-events-none opacity-20'
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <TransactionDetailModal
            transaction={selectedTx}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
