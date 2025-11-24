import { Wrench } from "lucide-react";
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
import type { MaintenanceStatistics } from "../../../types/mantenimiento";

interface MantenimientoReportProps {
  data: MaintenanceStatistics | null;
  isLoading: boolean;
  error: string | null;
}

export default function MantenimientoReport({ data, isLoading, error }: MantenimientoReportProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-base-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <Wrench className="size-6" />
            Historial de Mantenimiento por Vehículo
          </h2>
          <p className="mt-2 text-sm text-base-content/70">
            Análisis de costos y frecuencia de mantenimiento de la flota
          </p>
        </div>
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-base-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <Wrench className="size-6" />
            Historial de Mantenimiento por Vehículo
          </h2>
          <p className="mt-2 text-sm text-base-content/70">
            Análisis de costos y frecuencia de mantenimiento de la flota
          </p>
        </div>
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-base-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
          <Wrench className="size-6" />
          Historial de Mantenimiento por Vehículo
        </h2>
        <p className="mt-2 text-sm text-base-content/70">
          Análisis de costos y frecuencia de mantenimiento de la flota
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="stat bg-white rounded-2xl border border-base-200 shadow-sm">
          <div className="stat-title">Total Órdenes</div>
          <div className="stat-value text-primary">{data.total_ordenes}</div>
          <div className="stat-desc">Órdenes de mantenimiento</div>
        </div>

        {/* Total Maintenances Card */}
        <div className="stat bg-white rounded-2xl border border-base-200 shadow-sm">
          <div className="stat-title">Total Mantenimientos</div>
          <div className="stat-value text-secondary">{data.total_mantenimientos}</div>
          <div className="stat-desc">Servicios realizados</div>
        </div>

        {/* Total Cost Card */}
        <div className="stat bg-white rounded-2xl border border-base-200 shadow-sm">
          <div className="stat-title">Costo Total</div>
          <div className="stat-value text-accent">
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
            }).format(data.costo_total)}
          </div>
          <div className="stat-desc">Inversión total</div>
        </div>

        {/* Average Cost Card */}
        <div className="stat bg-white rounded-2xl border border-base-200 shadow-sm">
          <div className="stat-title">Costo Promedio</div>
          <div className="stat-value text-info">
            {new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
            }).format(data.costo_promedio)}
          </div>
          <div className="stat-desc">Por mantenimiento</div>
        </div>
      </div>

      {/* Top Vehicles Table */}
      <div className="rounded-2xl border border-base-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Top 5 Vehículos por Costo de Mantenimiento</h3>
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Posición</th>
                <th>Patente</th>
                <th>Cantidad de Mantenimientos</th>
                <th>Costo Total</th>
              </tr>
            </thead>
            <tbody>
              {data.top_vehiculos.map((vehiculo, index) => (
                <tr key={vehiculo.patente}>
                  <td>
                    <div className="badge badge-primary">{index + 1}</div>
                  </td>
                  <td className="font-semibold">{vehiculo.patente}</td>
                  <td>{vehiculo.cantidad_mantenimientos}</td>
                  <td className="font-semibold">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(vehiculo.costo_total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="rounded-2xl border border-base-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Distribución de Costos por Vehículo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.top_vehiculos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="patente" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) =>
                new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                }).format(value)
              }
            />
            <Legend />
            <Bar dataKey="costo_total" fill="#8884d8" name="Costo Total" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
