import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api/daños";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getTiposDaños = async () => {
  const response = await api.get("/tipoDaños");
  return response.data;
}

export const createDaño = async (id_tipo_daño, gravedad, id_sancion) => {
  const response = await api.post("/create", { id_tipo_daño, gravedad, id_sancion });
  return response.data;
}