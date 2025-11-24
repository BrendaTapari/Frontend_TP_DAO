import type { ExportPayload } from "./pdfExporter";
import type { Filters } from "../components/ReportFilters";
import type { ReportKey } from "../constants/reportOptions";
import type { ReportData } from "../hooks/useReportData";
import { formatCurrency, formatDate, formatNumber, formatPeriodo } from "./formatters";

export function buildExportData(
  selectedReport: ReportKey,
  data: ReportData,
  filters: Filters
): ExportPayload {
  const filterParts: string[] = [];
  if (filters.dni) {
    filterParts.push(`DNI ${filters.dni}`);
  }
  if (filters.fechaDesde || filters.fechaHasta) {
    const desde = filters.fechaDesde ? formatDate(filters.fechaDesde) : "Inicio";
    const hasta = filters.fechaHasta ? formatDate(filters.fechaHasta) : "Actualidad";
    filterParts.push(`${desde} → ${hasta}`);
  }
  filterParts.push(filters.incluirSanciones ? "Incluye sanciones" : "Sin sanciones");
  const subtitle = filterParts.filter(Boolean).join(" • ") || "Sin filtros adicionales";

  switch (selectedReport) {
    case "alquileres": {
      const title = "Listado detallado de alquileres por cliente";
      const columns = [
        "Cliente",
        "DNI",
        "Email",
        "Vehículo",
        "Patente",
        "Fechas",
        "ID",
        "Precio base",
        "Sanciones",
        "Total",
      ];

      const rows = data.ventasData.alquileres.map((alquiler) => [
        `${alquiler.cliente?.nombre ?? ""} ${alquiler.cliente?.apellido ?? ""}`.trim() || "-",
        alquiler.cliente?.dni ?? "-",
        alquiler.cliente?.email ?? "-",
        `${alquiler.vehiculo?.marca ?? ""} ${alquiler.vehiculo?.modelo ?? ""}`.trim() || "-",
        alquiler.vehiculo?.patente ?? "-",
        `${alquiler.fecha_inicio} → ${alquiler.fecha_fin}`,
        `#${alquiler.id_alquiler}`,
        formatCurrency(alquiler.precio_base),
        formatCurrency(alquiler.total_sanciones),
        formatCurrency(alquiler.total_general),
      ]);

      return {
        prefix: "alquileres-detallados",
        title,
        subtitle,
        columns,
        rows,
      };
    }
    case "vehiculos": {
      const title = "Vehículos más alquilados";
      const columns = ["Patente", "Marca", "Modelo", "Año", "Cantidad de alquileres"];
      const rows = data.vehiculosData.map((vehiculo) => [
        vehiculo.patente,
        vehiculo.marca,
        vehiculo.modelo,
        vehiculo.anio.toString(),
        formatNumber(vehiculo.cantidad_alquileres),
      ]);

      return {
        prefix: "vehiculos-mas-alquilados",
        title,
        subtitle,
        columns,
        rows,
      };
    }
    case "periodos": {
      const title = `Alquileres agrupados por ${filters.periodicidad === "mes" ? "mes" : "trimestre"}`;
      const columns = ["Período", "Cantidad", "Total alquileres"];
      const rows = data.alquileresPeriodo.map((registro) => [
        formatPeriodo(registro.periodo),
        formatNumber(registro.cantidad_alquileres),
        formatCurrency(registro.total_alquileres),
      ]);

      if (rows.length) {
        const totalCantidad = data.alquileresPeriodo.reduce(
          (accumulator, registro) => accumulator + registro.cantidad_alquileres,
          0
        );
        const totalMonto = data.alquileresPeriodo.reduce(
          (accumulator, registro) => accumulator + registro.total_alquileres,
          0
        );
        rows.push([
          "Totales",
          formatNumber(totalCantidad),
          formatCurrency(totalMonto),
        ]);
      }

      return {
        prefix: `alquileres-por-${filters.periodicidad}`,
        title,
        subtitle,
        columns,
        rows,
      };
    }
    case "facturacion": {
      const title = "Estadística de facturación mensual";
      const columns = ["Período", "Alquileres", "Sanciones", "Total"];
      const rows = data.facturacionData.periodos.map((periodo) => [
        periodo.periodo,
        formatCurrency(periodo.total_alquileres),
        formatCurrency(periodo.total_sanciones),
        formatCurrency(periodo.total_general),
      ]);

      if (rows.length) {
        rows.push([
          "Acumulado",
          formatCurrency(data.facturacionData.acumulado.total_alquileres),
          formatCurrency(data.facturacionData.acumulado.total_sanciones),
          formatCurrency(data.facturacionData.acumulado.total_general),
        ]);
      }

      return {
        prefix: "facturacion-mensual",
        title,
        subtitle,
        columns,
        rows,
      };
    }
    case "mantenimiento": {
      if (!data.mantenimientoData) {
        return { prefix: "mantenimiento-reporte", title: "Reporte de Mantenimiento", subtitle: "No hay datos disponibles", columns: [], rows: [] };
      }
      
      const maintenanceRows = data.mantenimientoData.top_vehiculos.map((v, i) => [
        `${i + 1}`,
        v.patente,
        `${v.cantidad_mantenimientos}`,
        formatCurrency(v.costo_total),
      ]);

      return {
        prefix: "mantenimiento-reporte",
        title: "Reporte de Mantenimiento",
        subtitle: `Período: ${filters.fechaDesde || "Inicio"} - ${filters.fechaHasta || "Actualidad"}`,
        columns: ["Posición", "Patente", "Cantidad", "Costo Total"],
        rows: maintenanceRows,
        sections: [
          {
            title: "Resumen General",
            content: [
              `Total de Órdenes: ${data.mantenimientoData.total_ordenes}`,
              `Total de Mantenimientos: ${data.mantenimientoData.total_mantenimientos}`,
              `Costo Total: ${formatCurrency(data.mantenimientoData.costo_total)}`,
              `Costo Promedio: ${formatCurrency(data.mantenimientoData.costo_promedio)}`,
            ],
          },
        ],
      };
    }
    default: {
      return { prefix: "reporte", title: "Reporte Desconocido", subtitle: "", columns: [], rows: [] };
    }
  }
}
