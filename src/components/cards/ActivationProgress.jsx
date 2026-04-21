/**
 * Barra de progreso que muestra el avance hacia las 10 compras
 * con débito requeridas para activar una tarjeta de crédito.
 */
export default function ActivationProgress({ count }) {
  const progress = Math.min((count / 10) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 rounded-full bg-red-100 overflow-hidden dark:bg-red-950">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
        {count}/10
      </span>
    </div>
  );
}
