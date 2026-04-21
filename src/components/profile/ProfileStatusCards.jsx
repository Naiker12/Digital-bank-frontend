import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, CheckCircle2 } from 'lucide-react';

export function ProfileStatusCards({ profileData }) {
  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 dark:border-slate-800 bg-slate-900 text-white overflow-hidden shadow-none">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <CreditCard className="h-24 w-24 -rotate-12" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-70">Documento de Identidad</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-mono tracking-tighter">
            {profileData?.document || '—'}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-full" />
            </div>
            <span className="text-[10px] font-bold uppercase">Activo</span>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
