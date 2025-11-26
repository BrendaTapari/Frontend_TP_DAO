import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/danos";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getTiposDaños = async () => {
  const response = await api.get("/tipoDanos");
  return response.data;
}

export const getTipoDañoById = async (id) => {
  const response = await api.get(`/tipoDano/${id}`);
  return response.data;
}

export const createTipoDaño = async (nombre, costoBase) => {
  const response = await api.post("/tipoDano/create", { nombre, costoBase });
  return response.data;
}

export const updateTipoDaño = async (id, nombre, costoBase) => {
  const response = await api.put(`/tipoDano/${id}`, { nombre, costoBase });
  return response.data;
}

export const deleteTipoDaño = async (id) => {
  const response = await api.delete(`/tipoDano/${id}`);
  return response.data;
}

export const createDaño = async (id_tipo_daño, gravedad, id_sancion) => {
  const response = await api.post("/create", { id_tipo_daño, gravedad, id_sancion });
  return response.data;
}