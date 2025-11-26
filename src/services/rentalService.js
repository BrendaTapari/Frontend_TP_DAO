import axios from "axios";

const API_URL = "http://localhost:3000/api/rentals/";

export const getRentals = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getSpecificRental = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
}

export const createRental = async (rentalData) => {
  const response = await axios.post(`${API_URL}`, rentalData);
  return response.data;
}

export const updateRental = async (id_alquiler, fecha_fin, costo_extra) => {
  console.log(id_alquiler, fecha_fin, costo_extra);
  const response = await axios.put(`${API_URL}${id_alquiler}`, { fecha_fin, costo_extra });
  return response.data;
}

export const payRental = async (id_alquiler) => {
  const response = await axios.put(`${API_URL}pay/${id_alquiler}`);
  return response.data;
}

export const carAvailable = async (patente_vehiculo, fecha_inicio, fecha_fin) => {
  const response = await axios.get(`${API_URL}carAvailable`, { params: { patente_vehiculo, fecha_inicio, fecha_fin } });
  return response.data;
}

// export const submitRentalDates = async (dates) => {
//   const response = await axios.post(`${API_URL}/dates`, dates);
//   return response.data;
// }

export const getActiveRentals = async () => {
  const response = await axios.get(`${API_URL}active`);
  return response.data;
}

export const getBadRentals = async () => {
  const response = await axios.get(`${API_URL}bad`);
  return response.data;
}

export const getSanciones = async () => {
  const response = await axios.get(`${API_URL}/sanciones`);
  return response.data;
}

export const createSancion = async (sancionData) => {
  const response = await axios.post(`${API_URL}/sanciones`, sancionData);
  return response.data;
}
