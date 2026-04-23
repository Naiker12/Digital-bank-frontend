import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StatsGrid({ stats }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="group overflow-hidden border-none shadow-sm transition-all hover:-translate-y-[2px] hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', stat.bg, stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn('text-2xl font-bold tracking-tight', stat.color)}>
              {stat.value}
            </p>
            {stat.desc && (
              <p className="mt-1 text-xs text-muted-foreground">{stat.desc}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
