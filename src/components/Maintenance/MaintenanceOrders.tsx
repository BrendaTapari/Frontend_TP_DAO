import { ArrowLeft, CalendarPlus, Eye, Plus, Trash2, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import type { OrdenMantenimiento, VehiculoBasico } from "../../types/mantenimiento";
import {
  fetchOrdenesMantenimiento,
  deleteOrdenMantenimiento,
} from "../../services/maintenanceService";
import { getAutos } from "../../services/autosService";
import { mockOrdenesMantenimiento, mockVehiculos } from "./mockData";
import CreateOrderModal from "./CreateOrderModal";
import ChangeMaintenanceDateModal from "./ChangeMaintenanceDateModal";

type SortField = "id_orden" | "patente_vehiculo" | "fecha_inicio" | "precio_acumulado";
type SortDirection = "asc" | "desc";

export default function MaintenanceOrders() {
  const [, setLocation] = useLocation();
  const [ordenes, setOrdenes] = useState<OrdenMantenimiento[]>([]);
  const [vehiculos, setVehiculos] = useState<VehiculoBasico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrderForDateChange, setSelectedOrderForDateChange] = useState<OrdenMantenimiento | null>(null);

  // Filters
  const [filterPatente, setFilterPatente] = useState("");
  const [filterFechaDesde, setFilterFechaDesde] = useState("");
  const [filterFechaHasta, setFilterFechaHasta] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<SortField>("id_orden");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [ordenesResult, vehiculosResult] = await Promise.allSettled([
        fetchOrdenesMantenimiento(),
        getAutos(),
      ]);

      // Handle ordenes
      if (ordenesResult.status === "fulfilled") {
        setOrdenes(ordenesResult.value);
      } else {
        console.error("Error fetching ordenes:", ordenesResult.reason);
        setOrdenes(mockOrdenesMantenimiento);
        setError("Error al cargar órdenes. Mostrando datos de ejemplo.");
      }

      // Handle vehiculos
      if (vehiculosResult.status === "fulfilled" && vehiculosResult.value?.length > 0) {
        setVehiculos(vehiculosResult.value);
      } else {
        setVehiculos(mockVehiculos);
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setOrdenes(mockOrdenesMantenimiento);
      setVehiculos(mockVehiculos);
      setError("Error al cargar datos. Mostrando datos de ejemplo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!globalThis.confirm("¿Está seguro de eliminar esta orden de mantenimiento?")) {
      return;
    }

    try {
      await deleteOrdenMantenimiento(id);
      setOrdenes((prev) => prev.filter((orden) => orden.id_orden !== id));
    } catch (err) {
      console.error("Error deleting orden:", err);
      alert("Error al eliminar la orden de mantenimiento");
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const calcularPrecioAcumulado = (orden: OrdenMantenimiento): number => {
    if (!orden.mantenimientos || orden.mantenimientos.length === 0) return 0;
    return orden.mantenimientos.reduce((sum, m) => sum + m.precio, 0);
  };

  const filteredAndSortedOrdenes = useMemo(() => {
    let result = [...ordenes];

    // Apply filters
    if (filterPatente) {
      result = result.filter((orden) =>
        orden.patente_vehiculo.toLowerCase().includes(filterPatente.toLowerCase())
      );
    }

    if (filterFechaDesde) {
      result = result.filter((orden) => orden.fecha_inicio >= filterFechaDesde);
    }

    if (filterFechaHasta) {
      result = result.filter((orden) => orden.fecha_fin <= filterFechaHasta);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "id_orden":
          aValue = a.id_orden;
          bValue = b.id_orden;
          break;
        case "patente_vehiculo":
          aValue = a.patente_vehiculo;
          bValue = b.patente_vehiculo;
          break;
        case "fecha_inicio":
          aValue = a.fecha_inicio;
          bValue = b.fecha_inicio;
          break;
        case "precio_acumulado":
          aValue = calcularPrecioAcumulado(a);
          bValue = calcularPrecioAcumulado(b);
          break;
        default:
          aValue = a.id_orden;
          bValue = b.id_orden;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [ordenes, filterPatente, filterFechaDesde, filterFechaHasta, sortField, sortDirection]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("es-AR");
  };

  const handleResetFilters = () => {
    setFilterPatente("");
    setFilterFechaDesde("");
    setFilterFechaHasta("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="rounded-3xl border border-base-200 bg-white shadow-xl">
          <div className="px-6 py-8 sm:px-10">
            <div className="flex flex-col gap-6">
              <button
                className="btn btn-ghost w-fit gap-2 text-sm font-medium"
                onClick={() => setLocation("/")}
                type="button"
              >
                <ArrowLeft className="size-4" /> Volver al inicio
              </button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-base-content">
                    Gestión de Mantenimiento
                  </h1>
                  <p className="text-base text-base-content/70 max-w-2xl">
                    Controla y programa el mantenimiento de toda la flota vehicular
                  </p>
                </div>
                <button
                  className="btn btn-primary gap-2"
                  onClick={() => setShowCreateModal(true)}
                  type="button"
                >
                  <Plus className="size-4" />
                  Nueva Orden
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Filters Bar - Compact Horizontal Layout */}
        <div className="rounded-3xl border border-base-200 bg-white p-4 shadow-lg">
          <div className="flex flex-wrap items-end gap-3">
            <div className="form-control flex-1 min-w-[180px]">
              <label className="label py-1" htmlFor="filter-patente">
                <span className="label-text text-xs font-medium">Vehículo (Patente)</span>
              </label>
              <input
                id="filter-patente"
                type="text"
                placeholder="Ej: ABC123"
                className="input input-bordered input-sm w-full"
                value={filterPatente}
                onChange={(e) => setFilterPatente(e.target.value)}
              />
            </div>

            <div className="form-control flex-1 min-w-[160px]">
              <label className="label py-1" htmlFor="filter-fecha-desde">
                <span className="label-text text-xs font-medium">Fecha desde</span>
              </label>
              <input
                id="filter-fecha-desde"
                type="date"
                className="input input-bordered input-sm w-full"
                value={filterFechaDesde}
                onChange={(e) => setFilterFechaDesde(e.target.value)}
              />
            </div>

            <div className="form-control flex-1 min-w-[160px]">
              <label className="label py-1" htmlFor="filter-fecha-hasta">
                <span className="label-text text-xs font-medium">Fecha hasta</span>
              </label>
              <input
                id="filter-fecha-hasta"
                type="date"
                className="input input-bordered input-sm w-full"
                value={filterFechaHasta}
                onChange={(e) => setFilterFechaHasta(e.target.value)}
              />
            </div>

            <button
              className="btn btn-ghost btn-sm"
              onClick={handleResetFilters}
              type="button"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Alert */}
        {error && (
          <div className="alert alert-warning">
            <Wrench className="size-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="rounded-3xl border border-base-200 bg-white p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-base-content">
              Órdenes de Mantenimiento
            </h2>
            <p className="mt-1 text-sm text-base-content/70">
              {filteredAndSortedOrdenes.length} orden(es) encontrada(s)
            </p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-base-content/50">
              Cargando órdenes...
            </div>
          ) : filteredAndSortedOrdenes.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-base-content/50">
              <Wrench className="size-12 mb-4" />
              <p>No hay órdenes de mantenimiento que coincidan con los filtros</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th
                      className="cursor-pointer hover:bg-base-200"
                      onClick={() => handleSort("id_orden")}
                    >
                      ID {sortField === "id_orden" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer hover:bg-base-200"
                      onClick={() => handleSort("patente_vehiculo")}
                    >
                      Vehículo{" "}
                      {sortField === "patente_vehiculo" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer hover:bg-base-200"
                      onClick={() => handleSort("fecha_inicio")}
                    >
                      Período{" "}
                      {sortField === "fecha_inicio" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="cursor-pointer hover:bg-base-200 text-right"
                      onClick={() => handleSort("precio_acumulado")}
                    >
                      Precio Acumulado{" "}
                      {sortField === "precio_acumulado" && (sortDirection === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedOrdenes.map((orden) => (
                    <tr key={orden.id_orden} className="hover">
                      <td className="font-mono">#{orden.id_orden}</td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-semibold">{orden.patente_vehiculo}</span>
                          {orden.vehiculo && (
                            <span className="text-xs text-base-content/60">
                              {orden.vehiculo.marca} {orden.vehiculo.modelo}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {formatDate(orden.fecha_inicio)} → {formatDate(orden.fecha_fin)}
                        </div>
                      </td>
                      <td className="text-right font-semibold">
                        {formatCurrency(calcularPrecioAcumulado(orden))}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setLocation(`/car-maintenance/${orden.id_orden}`)}
                            title="Ver detalle"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() => handleDelete(orden.id_orden)}
                            title="Eliminar"
                          >
                            <Trash2 className="size-4" />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setSelectedOrderForDateChange(orden)}
                            title="Cambiar fecha fin"
                          >
                            <CalendarPlus className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateOrderModal
          vehiculos={vehiculos}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      {selectedOrderForDateChange && (
        <ChangeMaintenanceDateModal
          ordenId={selectedOrderForDateChange.id_orden}
          currentEndDate={selectedOrderForDateChange.fecha_fin}
          onClose={() => setSelectedOrderForDateChange(null)}
          onSuccess={() => {
            setSelectedOrderForDateChange(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
