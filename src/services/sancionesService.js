import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/sanciones";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getTipoSanciones = async () => {
  const response = await api.get("/tipoSanciones");
  return response.data;
}

export const getSancionesNuevas = async () => {
  const response = await api.get("/nuevas");
  return response.data;
}

export const createSancion = async (id_tipo_sancion, costo_base, descripcion, id_alquiler, daños) => {
  const response = await api.post("/create", {id_tipo_sancion, costo_base, descripcion, id_alquiler});
  return response.data;
}

export const paySancion = async (id_sancion) => {
  const response = await api.put(`/pay/${id_sancion}`);
  return response.data;
}