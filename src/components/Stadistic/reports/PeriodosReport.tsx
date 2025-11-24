import type { AlquilerPeriodo } from "../../../types/reportes";
import { formatCurrency, formatNumber, formatPeriodo } from "../utils/formatters";

interface PeriodosReportProps {
  data: AlquilerPeriodo[];
  isLoading: boolean;
  error: string | null;
  periodicidad: "mes" | "trimestre";
}

export default function PeriodosReport({ data, isLoading, error, periodicidad }: PeriodosReportProps) {
  return (
    <div className="rounded-3xl border border-base-200 bg-white p-6 shadow-lg">
      <header className="mb-6">
        <h3 className="text-xl font-semibold text-base-content">
          Alquileres por {periodicidad}
        </h3>
      </header>

      {error && (
        <div className="alert alert-warning text-sm mb-4">
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-base-content/50">
          Cargando datos...
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-base-content/50">
          No hay datos para mostrar.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Período</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Total alquileres</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.periodo}>
                  <td className="font-mono text-sm">{formatPeriodo(item.periodo)}</td>
                  <td className="text-right">{formatNumber(item.cantidad_alquileres)}</td>
                  <td className="text-right">{formatCurrency(item.total_alquileres)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
