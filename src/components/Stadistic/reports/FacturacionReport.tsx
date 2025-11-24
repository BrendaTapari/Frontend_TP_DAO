import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FacturacionData } from "../../../types/reportes";
import { formatCurrency } from "../utils/formatters";
import { useMemo } from "react";

interface FacturacionReportProps {
  data: FacturacionData;
  isLoading: boolean;
  error: string | null;
}

export default function FacturacionReport({ data, isLoading, error }: FacturacionReportProps) {
  const chartData = useMemo(() => {
    return data.periodos.map((periodo) => ({
      periodo: periodo.periodo,
      alquileres: periodo.total_alquileres,
      sanciones: periodo.total_sanciones,
      total: periodo.total_general,
    }));
  }, [data]);

  return (
    <div className="rounded-3xl border border-base-200 bg-white p-6 shadow-lg">
      <header className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-base-content">
          Facturación mensual
        </h3>
      </header>

      {error && (
        <div className="alert alert-warning text-sm mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="mt-4 h-[320px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-base-content/50">
            Cargando facturación...
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-base-content/50">
            No hay datos para los filtros seleccionados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="periodo" tickMargin={8} />
              <YAxis
                tickFormatter={(value) =>
                  formatCurrency(value).replace("ARS", "").trim()
                }
              />
              <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="alquileres" fill="#4338ca" name="Alquileres" radius={[6, 6, 0, 0]} />
              <Bar dataKey="sanciones" fill="#0ea5e9" name="Sanciones" radius={[6, 6, 0, 0]} />
              <Bar dataKey="total" fill="#22c55e" name="Total" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
