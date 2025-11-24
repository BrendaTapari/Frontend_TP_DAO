import { useEffect, useState } from "react";
import {
  fetchAlquileresDetallados,
  fetchAlquileresPorPeriodo,
  fetchFacturacionMensual,
  fetchVehiculosMasAlquilados,
} from "../../../services/reportService";
import { fetchMaintenanceStatistics } from "../../../services/maintenanceService";
import type {
  AlquileresResponse,
  AlquilerPeriodo,
  FacturacionData,
  VehiculoMasAlquilado,
} from "../../../types/reportes";
import type { MaintenanceStatistics } from "../../../types/mantenimiento";
import type { Filters } from "../components/ReportFilters";
import {
  mockAlquileresPorPeriodo,
  mockAlquileresResponse,
  mockFacturacionData,
  mockVehiculosMasAlquilados,
} from "../mockData";
import { clone, extractErrorMessage } from "../utils/formatters";

const buildMockFacturacion = (includeSanciones: boolean): FacturacionData => ({
  ...mockFacturacionData,
  incluir_sanciones: includeSanciones,
  acumulado: { ...mockFacturacionData.acumulado },
  periodos: mockFacturacionData.periodos.map((periodo) => ({ ...periodo })),
});

export interface ReportData {
  ventasData: AlquileresResponse;
  vehiculosData: VehiculoMasAlquilado[];
  facturacionData: FacturacionData;
  alquileresPeriodo: AlquilerPeriodo[];
  mantenimientoData: MaintenanceStatistics | null;
}

export interface ReportLoading {
  ventasLoading: boolean;
  autosLoading: boolean;
  facturacionLoading: boolean;
  periodoLoading: boolean;
  mantenimientoLoading: boolean;
}

export interface ReportErrors {
  ventasError: string | null;
  autosError: string | null;
  facturacionError: string | null;
  periodoError: string | null;
  mantenimientoError: string | null;
}

export function useReportData(filters: Filters) {
  const [data, setData] = useState<ReportData>({
    ventasData: clone(mockAlquileresResponse),
    vehiculosData: clone(mockVehiculosMasAlquilados),
    facturacionData: buildMockFacturacion(true),
    alquileresPeriodo: clone(mockAlquileresPorPeriodo),
    mantenimientoData: null,
  });

  const [loading, setLoading] = useState<ReportLoading>({
    ventasLoading: false,
    autosLoading: false,
    facturacionLoading: false,
    periodoLoading: false,
    mantenimientoLoading: false,
  });

  const [errors, setErrors] = useState<ReportErrors>({
    ventasError: null,
    autosError: null,
    facturacionError: null,
    periodoError: null,
    mantenimientoError: null,
  });

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading({
        ventasLoading: true,
        autosLoading: true,
        facturacionLoading: true,
        periodoLoading: true,
        mantenimientoLoading: true,
      });

      setErrors({
        ventasError: null,
        autosError: null,
        facturacionError: null,
        periodoError: null,
        mantenimientoError: null,
      });

      const [alquileresResult, vehiculosResult, facturacionResult, periodoResult, mantenimientoResult] =
        await Promise.allSettled([
          fetchAlquileresDetallados({
            dni: filters.dni || undefined,
            fechaDesde: filters.fechaDesde || undefined,
            fechaHasta: filters.fechaHasta || undefined,
          }),
          fetchVehiculosMasAlquilados({
            fechaDesde: filters.fechaDesde || undefined,
            fechaHasta: filters.fechaHasta || undefined,
            limit: 10,
          }),
          fetchFacturacionMensual({
            fechaDesde: filters.fechaDesde || undefined,
            fechaHasta: filters.fechaHasta || undefined,
            incluirSanciones: filters.incluirSanciones,
          }),
          fetchAlquileresPorPeriodo({
            periodicidad: filters.periodicidad,
            fechaDesde: filters.fechaDesde || undefined,
            fechaHasta: filters.fechaHasta || undefined,
          }),
          fetchMaintenanceStatistics({
            fecha_desde: filters.fechaDesde || undefined,
            fecha_hasta: filters.fechaHasta || undefined,
          }),
        ]);

      if (!active) return;

      let refreshedAny = false;
      const newData = { ...data };
      const newErrors = { ...errors };

      // Handle alquileres
      if (alquileresResult.status === "fulfilled") {
        const value = alquileresResult.value;
        const isEmptyResponse = !value?.alquileres?.length && !value?.resumen_clientes?.length;

        if (isEmptyResponse) {
          newData.ventasData = clone(mockAlquileresResponse);
          newErrors.ventasError = "Mostrando datos de referencia. No hay alquileres registrados para los filtros actuales.";
        } else {
          newData.ventasData = value;
          refreshedAny = true;
        }
      } else {
        newData.ventasData = clone(mockAlquileresResponse);
        newErrors.ventasError =
          "Mostrando datos de referencia. No se pudieron cargar los alquileres por cliente: " +
          extractErrorMessage(alquileresResult.reason);
      }

      // Handle vehiculos
      if (vehiculosResult.status === "fulfilled") {
        const value = vehiculosResult.value;
        const isEmptyResponse = !value?.length;

        if (isEmptyResponse) {
          newData.vehiculosData = clone(mockVehiculosMasAlquilados);
          newErrors.autosError = "Mostrando datos de referencia. No hay vehículos con alquileres en el período seleccionado.";
        } else {
          newData.vehiculosData = value;
          refreshedAny = true;
        }
      } else {
        newData.vehiculosData = clone(mockVehiculosMasAlquilados);
        newErrors.autosError =
          "Mostrando datos de referencia. No se pudo obtener el ranking de vehículos: " +
          extractErrorMessage(vehiculosResult.reason);
      }

      // Handle facturacion
      if (facturacionResult.status === "fulfilled") {
        const value = facturacionResult.value;
        const isEmptyResponse = !value?.periodos?.length;

        if (isEmptyResponse) {
          newData.facturacionData = buildMockFacturacion(filters.incluirSanciones);
          newErrors.facturacionError = "Mostrando datos de referencia. No hay movimientos de facturación para los filtros elegidos.";
        } else {
          newData.facturacionData = value;
          refreshedAny = true;
        }
      } else {
        newData.facturacionData = buildMockFacturacion(filters.incluirSanciones);
        newErrors.facturacionError =
          "Mostrando datos de referencia. No se pudo obtener la facturación mensual: " +
          extractErrorMessage(facturacionResult.reason);
      }

      // Handle periodo
      if (periodoResult.status === "fulfilled") {
        const value = periodoResult.value;
        const isEmptyResponse = !value?.length;

        if (isEmptyResponse) {
          newData.alquileresPeriodo = clone(mockAlquileresPorPeriodo);
          newErrors.periodoError = "Mostrando datos de referencia. No hay agrupamientos disponibles para los filtros aplicados.";
        } else {
          newData.alquileresPeriodo = value;
          refreshedAny = true;
        }
      } else {
        newData.alquileresPeriodo = clone(mockAlquileresPorPeriodo);
        newErrors.periodoError =
          "Mostrando datos de referencia. No se pudo obtener el agrupamiento por período: " +
          extractErrorMessage(periodoResult.reason);
      }

      // Handle mantenimiento
      if (mantenimientoResult.status === "fulfilled") {
        newData.mantenimientoData = mantenimientoResult.value;
        refreshedAny = true;
      } else {
        newErrors.mantenimientoError = "Error al cargar estadísticas de mantenimiento";
      }

      setData(newData);
      setErrors(newErrors);
      setLoading({
        ventasLoading: false,
        autosLoading: false,
        facturacionLoading: false,
        periodoLoading: false,
        mantenimientoLoading: false,
      });

      if (refreshedAny) {
        setLastUpdate(new Date());
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [filters]);

  return { data, loading, errors, lastUpdate };
}
