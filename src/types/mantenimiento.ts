export interface VehiculoBasico {
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
}

export interface Mantenimiento {
  id_mantenimiento: number;
  id_orden_mantenimiento: number;
  descripcion: string;
  precio: number;
}

export interface OrdenMantenimiento {
  id_orden: number;
  patente_vehiculo: string;
  fecha_inicio: string;
  fecha_fin: string;
  vehiculo?: VehiculoBasico;
  mantenimientos?: Mantenimiento[];
}

export interface CreateOrdenMantenimientoData {
  patente_vehiculo: string;
  fecha_inicio: string;
  fecha_fin: string;
  primer_mantenimiento?: {
    descripcion: string;
    precio: number;
  };
}

export interface CreateMantenimientoData {
  descripcion: string;
  precio: number;
}

export interface UpdateMantenimientoData {
  descripcion?: string;
  precio?: number;
}

export interface MaintenanceStatistics {
  total_ordenes: number;
  total_mantenimientos: number;
  costo_total: number;
  costo_promedio: number;
  top_vehiculos: {
    patente: string;
    costo_total: number;
    cantidad_mantenimientos: number;
  }[];
}
