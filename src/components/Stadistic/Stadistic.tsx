import { ArrowLeft, BarChart3, Printer, ShoppingCart, Users, Wrench, Car, DollarSign, TrendingDown } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

import AutosStadistics from "./AutosStadistics";
import VentasStadistics from "./VentasStadistics";
import MetricCard from "./components/MetricCard";
import ReportFilters, { type Filters } from "./components/ReportFilters";
import PeriodosReport from "./reports/PeriodosReport";
import FacturacionReport from "./reports/FacturacionReport";
import MantenimientoReport from "./reports/MantenimientoReport";

import { reportOptions, type ReportKey } from "./constants/reportOptions";
import { formatCurrency, formatNumber } from "./utils/formatters";
import { exportToPDF, buildFileName } from "./utils/pdfExporter";
import { buildExportData } from "./utils/exportHelpers";
import { useReportData } from "./hooks/useReportData";

const defaultFilters: Filters = {
  dni: "",
  fechaDesde: "",
  fechaHasta: "",
  periodicidad: "mes",
  incluirSanciones: true,
};

export default function Stadistic() {
  const [, setLocation] = useLocation();
  const [selectedReport, setSelectedReport] = useState<ReportKey>("facturacion");
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const { data, loading, errors, lastUpdate } = useReportData(filters);

  const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ ...defaultFilters });
  };

  const handleBackArrow = () => setLocation("/");

  const handleExportReport = () => {
    const exportData = buildExportData(selectedReport, data, filters);

    if (!exportData.rows.length && selectedReport !== "mantenimiento") {
      globalThis.alert("No hay datos disponibles para exportar en este reporte.");
      return;
    }

    try {
      const doc = exportToPDF({
        exportData,
        selectedReport,
        facturacionData: selectedReport === "facturacion" ? data.facturacionData : undefined,
        mantenimientoData: selectedReport === "mantenimiento" ? data.mantenimientoData : undefined,
        formatCurrency,
      });

      doc.save(buildFileName(exportData.prefix, "pdf"));
    } catch (error) {
      console.error("Error exporting report:", error);
      globalThis.alert("Ocurrió un error al exportar el reporte.");
    }
  };

  const activeReport = reportOptions.find((option) => option.key === selectedReport);
  const showDniField = selectedReport === "alquileres";
  const showPeriodicityField = selectedReport === "periodos";
  const showIncludeSancionesToggle = selectedReport === "facturacion";
  const showDateFilters = true;

  // Metric cards for header
  const headerMetrics = useMemo(() => {
    if (selectedReport === "facturacion") {
      return [
        {
          icon: BarChart3,
          title: "Facturación por alquileres",
          value: formatCurrency(data.facturacionData.acumulado.total_alquileres),
          helper: "Subtotal sin sanciones",
        },
        {
          icon: ShoppingCart,
          title: "Ingresos por sanciones",
          value: formatCurrency(data.facturacionData.acumulado.total_sanciones),
          helper: filters.incluirSanciones ? "Incluyendo sanciones" : "No incluidas",
        },
        {
          icon: Users,
          title: "Total general",
          value: formatCurrency(data.facturacionData.acumulado.total_general),
          helper: "Alquileres + sanciones",
        },
      ];
    } else if (selectedReport === "mantenimiento" && data.mantenimientoData) {
      return [
        {
          icon: Wrench,
          title: "Total Órdenes",
          value: formatNumber(data.mantenimientoData.total_ordenes),
          helper: "Órdenes de mantenimiento",
        },
        {
          icon: Car,
          title: "Total Mantenimientos",
          value: formatNumber(data.mantenimientoData.total_mantenimientos),
          helper: "Servicios realizados",
        },
        {
          icon: DollarSign,
          title: "Costo Total",
          value: formatCurrency(data.mantenimientoData.costo_total),
          helper: "Inversión total",
        },
        {
          icon: TrendingDown,
          title: "Costo Promedio",
          value: formatCurrency(data.mantenimientoData.costo_promedio),
          helper: "Por mantenimiento",
        },
      ];
    }
    return [];
  }, [selectedReport, data, filters.incluirSanciones]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-base-200 bg-white shadow-xl">
          <div className="px-6 py-8 sm:px-10">
            <div className="flex flex-col gap-6">
              <button
                className="btn btn-ghost w-fit gap-2 text-sm font-medium"
                onClick={handleBackArrow}
                type="button"
              >
                <ArrowLeft className="size-4" /> Volver al inicio
              </button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-base-content">
                    Gestión de reportes
                  </h1>
                  <p className="text-base text-base-content/70 max-w-2xl">
                    Explorá el rendimiento del negocio, analizá la facturación y anticipá decisiones clave para tu flota.
                  </p>
                </div>
                <div className="text-sm text-base-content/70">
                  <span className="block text-xs uppercase tracking-wide">Última actualización</span>
                  <span className="font-semibold text-base-content">
                    {lastUpdate
                      ? lastUpdate.toLocaleString("es-AR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "Datos de demostración"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-base-200 bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-lg font-semibold text-base-content">
                Tipo de reporte
              </h2>
              <div className="space-y-2">
                {reportOptions.map((option) => (
                  <button
                    key={option.key}
                    className={`btn w-full justify-start gap-3 ${
                      selectedReport === option.key
                        ? "btn-primary"
                        : "btn-ghost"
                    }`}
                    onClick={() => setSelectedReport(option.key)}
                    type="button"
                  >
                    <option.icon className="size-5" />
                    <span className="text-left text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-base-200 bg-white p-6 shadow-lg">
              <ReportFilters
                filters={filters}
                showDniField={showDniField}
                showPeriodicityField={showPeriodicityField}
                showIncludeSancionesToggle={showIncludeSancionesToggle}
                showDateFilters={showDateFilters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
              />
            </div>
          </aside>

          <main className="space-y-6">
            {activeReport && (
              <div className="rounded-3xl border border-base-200 bg-white p-6 shadow-lg">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-base-content">
                      {activeReport.label}
                    </h2>
                    <p className="mt-1 text-sm text-base-content/70">
                      {activeReport.description}
                    </p>
                  </div>
                  <button
                    className="btn btn-primary gap-2"
                    onClick={handleExportReport}
                    type="button"
                  >
                    <Printer className="size-4" />
                    Exportar PDF
                  </button>
                </div>
              </div>
            )}

            {headerMetrics.length > 0 && (
              <section className="rounded-3xl bg-white p-6 shadow-lg">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {headerMetrics.map((metric, index) => (
                    <MetricCard key={metric.title} variant={index} {...metric} />
                  ))}
                </div>
              </section>
            )}

            <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
              <div className="space-y-6">
                {selectedReport === "alquileres" && (
                  <VentasStadistics
                    resumenClientes={data.ventasData.resumen_clientes}
                    alquileres={data.ventasData.alquileres}
                    isLoading={loading.ventasLoading}
                    error={errors.ventasError}
                  />
                )}

                {selectedReport === "vehiculos" && (
                  <AutosStadistics
                    vehiculos={data.vehiculosData}
                    isLoading={loading.autosLoading}
                    error={errors.autosError}
                  />
                )}

                {selectedReport === "periodos" && (
                  <PeriodosReport
                    data={data.alquileresPeriodo}
                    isLoading={loading.periodoLoading}
                    error={errors.periodoError}
                    periodicidad={filters.periodicidad}
                  />
                )}

                {selectedReport === "facturacion" && (
                  <FacturacionReport
                    data={data.facturacionData}
                    isLoading={loading.facturacionLoading}
                    error={errors.facturacionError}
                  />
                )}
              </div>
            </section>
          </main>
        </div>

        {selectedReport === "mantenimiento" && (
          <MantenimientoReport
            data={data.mantenimientoData}
            isLoading={loading.mantenimientoLoading}
            error={errors.mantenimientoError}
          />
        )}
      </div>
    </div>
  );
}
