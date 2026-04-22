import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

/**
 * Indicador de progreso visual para el flujo de pago asíncrono.
 * Muestra tres fases: Inicio → Procesando → Finalizado, con estados
 * de éxito y error.
 */
export default function PaymentTracker({ status, error, service, onReset }) {
  const steps = [
    { id: 'INITIAL', label: 'Iniciando Pago', progress: 33 },
    { id: 'IN_PROGRESS', label: 'Procesando Transacción', progress: 66 },
    { id: 'FINISH', label: '¡Pago Exitoso!', progress: 100 },
  ];

  const currentStep = steps.find((s) => s.id === status) ||
    (status === 'FAILED' ? steps[1] : steps[0]);
  const progress = status === 'FAILED' ? 100 : currentStep.progress;

  return (
    <div className="space-y-5 p-1 py-5 sm:space-y-6 sm:p-2 sm:py-6">
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <div className={cn(
          'h-14 w-14 rounded-full flex items-center justify-center mb-2 animate-in zoom-in duration-500 shadow-lg sm:h-16 sm:w-16',
          status === 'FINISH' ? 'bg-emerald-500/20 text-emerald-500 ring-2 ring-emerald-500/20' :
            status === 'FAILED' ? 'bg-rose-500/20 text-rose-500 ring-2 ring-rose-500/20' :
              'bg-primary/20 text-primary ring-2 ring-primary/20'
        )}>
          {status === 'FINISH' ? <CheckCircle2 className="h-8 w-8" /> :
            status === 'FAILED' ? <XCircle className="h-8 w-8" /> :
              <Loader2 className="h-8 w-8 animate-spin" />}
        </div>
        <h3 className="text-lg font-extrabold tracking-tight sm:text-xl">
          {status === 'FINISH' ? '¡Transacción Confirmada!' :
            status === 'FAILED' ? 'Hubo un problema' : 'Operación en Curso'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-full sm:max-w-[300px] leading-relaxed">
          {status === 'INITIAL' && 'Iniciando proceso de pago seguro...'}
          {status === 'IN_PROGRESS' && 'Validando fondos y confirmando la transacción con el banco...'}
          {status === 'FINISH' && `Pago a ${service.proveedor} completado con éxito. Se ha generado su comprobante.`}
          {status === 'FAILED' && (error || 'La transacción no pudo completarse. Por favor, verifique su saldo o intente más tarde.')}
        </p>
      </div>

      <div className="space-y-4 px-2 pt-4 sm:px-4">
        <Progress
          value={progress}
          className={cn('h-1.5 transition-all duration-1000', status === 'FAILED' ? 'bg-rose-100' : 'bg-primary/10')}
        />
        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 sm:text-[9px]">
          <span className={status === 'INITIAL' || status === 'IN_PROGRESS' || status === 'FINISH' ? 'text-primary/70' : ''}>Inicio</span>
          <span className={status === 'IN_PROGRESS' || status === 'FINISH' ? 'text-primary/70' : ''}>Procesando</span>
          <span className={status === 'FINISH' ? 'text-primary/70' : ''}>Finalizado</span>
        </div>
      </div>

      {(status === 'FINISH' || status === 'FAILED') ? (
        <div className="pt-4">
          <Button
            className={cn(
              'w-full rounded-xl py-5 font-bold uppercase tracking-widest text-xs sm:py-6',
              status === 'FAILED' ? 'bg-rose-500 hover:bg-rose-600' : ''
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
            className="w-full rounded-xl py-5 font-bold uppercase tracking-widest text-xs border-dashed sm:py-6"
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
