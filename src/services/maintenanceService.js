import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/mantenimiento";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Ordenes de mantenimiento 
export const fetchOrdenesMantenimiento = async () => {
  const response = await api.get("/ordenes");
  // Backend devuelve {ordenes: [], total, page, per_page, total_pages}
  // Extraemos solo el array de órdenes para mantener compatibilidad
  return response.data.ordenes || response.data;
};

export const fetchOrdenById = async (id) => {
  const response = await api.get(`/ordenes/${id}`);
  return response.data;
};

export const createOrdenMantenimiento = async (data) => {
  const response = await api.post("/ordenes", data);
  return response.data;
};

export const updateOrdenMantenimiento = async (id, fecha_fin) => {
  const response = await api.put(`/ordenes/${id}/edit`, {fecha_fin: fecha_fin});
  return response.data;
};

export const deleteOrdenMantenimiento = async (id) => {
  const response = await api.delete(`/ordenes/${id}`);
  return response.data;
};

// Mantenimientos individuales
export const createMantenimiento = async (ordenId, data) => {
  const response = await api.post(`/ordenes/${ordenId}/mantenimientos`, data);
  return response.data;
};

export const updateMantenimiento = async (id, data) => {
  const response = await api.put(`/mantenimientos/${id}`, data);
  return response.data;
};

export const deleteMantenimiento = async (id) => {
  const response = await api.delete(`/mantenimientos/${id}`);
  return response.data;
};

// Estadísticas
export const fetchMaintenanceStatistics = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.patente) params.append('patente', filters.patente);
  if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
  if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
  
  const response = await api.get(`/estadisticas?${params.toString()}`);
  return response.data;
};
