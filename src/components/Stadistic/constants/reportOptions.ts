import { Car, Medal, ShoppingCart, TrendingUp, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ReportKey = "alquileres" | "vehiculos" | "periodos" | "facturacion" | "mantenimiento";

export const reportOptions: {
  key: ReportKey;
  icon: LucideIcon;
  label: string;
  description: string;
}[] = [
  {
    key: "alquileres",
    icon: ShoppingCart,
    label: "Listado detallado de alquileres por cliente",
    description:
      "Analizá cada alquiler, totales por cliente y sanciones asociadas para entender el comportamiento individual.",
  },
  {
    key: "vehiculos",
    icon: Car,
    label: "Vehículos más alquilados",
    description:
      "Identificá los autos con mayor demanda y optimizá tu flota según las preferencias del mercado.",
  },
  {
    key: "periodos",
    icon: TrendingUp,
    label: "Ventas agrupadas por período",
    description:
      "Visualizá la evolución de tus alquileres mes a mes o trimestre a trimestre para detectar tendencias.",
  },
  {
    key: "facturacion",
    icon: Medal,
    label: "Estadística de facturación mensual",
    description:
      "Monitoreá ingresos totales, sanciones y facturación general para tomar decisiones financieras informadas.",
  },
  {
    key: "mantenimiento",
    icon: Wrench,
    label: "Historial de mantenimiento por vehículo",
    description:
      "Consultá el historial completo de mantenimiento de cada vehículo, costos acumulados y próximos servicios programados.",
  },
];
