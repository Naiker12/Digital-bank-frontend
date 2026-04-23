import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { cardService, getDebitPurchaseCount } from '@/services/cardService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Lock, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';

import BankCard from '@/components/cards/BankCard';
import CardFundsDialog from '@/components/cards/CardFundsDialog';
import ActivationProgress from '@/components/cards/ActivationProgress';

export default function CardsPage() {
  const user = useAuthStore((s) => s.user);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [purchaseCount, setPurchaseCount] = useState(0);

  const fetchCards = async () => {
    if (!user?.uuid) return;

    try {
      setLoading(true);
      const result = await cardService.getUserCards(user.uuid);
        if (result.success) {
          const activeCards = result.data
            .filter((card) => ['ACTIVATED', 'ACTIVE', 'PENDING'].includes(card.status) || !card.status)
            .map((card) => ({
              ...card,
            holder: `${user.name || ''} ${user.lastName || ''}`.trim() || card.holderName,
            last4: (card.cardNumber || '').slice(-4),
              number: card.cardNumber || '****',
              expiry: card.expiryDate,
            }));
          setCards(activeCards);
          const count = await getDebitPurchaseCount(user.uuid, activeCards);
          setPurchaseCount(count);
        } else {
          toast.error(result.message);
        }
    } catch (error) {
      console.error('Error fetching cards:', error);
      toast.error('No se pudieron cargar tus tarjetas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [user?.uuid, user?.name, user?.lastName]);

  return (
    <div className="space-y-8 pb-10">

      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-mesh-pattern opacity-10" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mis Tarjetas</h1>
            <p className="mt-1 text-slate-400">
              Toca una tarjeta para recargarla o pagarla según su tipo.
            </p>
          </div>
          <Button className="rounded-xl bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90">
            <CreditCard className="mr-2 h-4 w-4" />
            Solicitar Nueva
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const isCreditLocked = card.type === 'CREDIT' && purchaseCount < 10;
            const isPending = isCreditLocked || card.status === 'PENDING';
            const remaining = Math.max(10 - purchaseCount, 0);

            return (
              <Card key={card.uuid || card.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="h-4 w-4" />
                      {card.typeLabel}
                    </CardTitle>
                    {isPending ? (
                      <Badge variant="destructive" className="gap-1">
                        <ShieldOff className="h-3 w-3" />
                        Inactiva
                      </Badge>
                    ) : (
                      <Badge variant={card.status === 'ACTIVE' || card.status === 'ACTIVATED' ? 'default' : 'secondary'}>
                        {card.status === 'ACTIVE' || card.status === 'ACTIVATED' ? 'Activa' : card.status}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>•••• {card.last4}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <BankCard
                    card={card}
                    onSelect={isPending ? null : setSelectedCard}
                    purchaseCount={purchaseCount}
                    locked={isCreditLocked}
                  />

                  {isPending ? (
                    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-red-500" />
                        <p className="text-xs font-bold text-red-700 dark:text-red-400">
                          Requiere 10 compras con débito para activar
                        </p>
                      </div>
                      <ActivationProgress count={purchaseCount} />
                      <p className="text-[10px] text-red-600/70 dark:text-red-400/50 leading-relaxed">
                        Realiza {remaining} compra{remaining !== 1 ? 's' : ''} más con tu tarjeta de débito para desbloquear esta tarjeta de crédito.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Saldo</p>
                        <p className="text-lg font-bold">
                          {Number(card.balance || 0).toFixed(2)} US$
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => setSelectedCard(card)} disabled={isCreditLocked}>
                        {card.type === 'CREDIT' ? 'Pagar' : 'Recargar'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CardFundsDialog
        card={selectedCard}
        open={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        onSuccess={fetchCards}
      />
    </div>
  );
}
