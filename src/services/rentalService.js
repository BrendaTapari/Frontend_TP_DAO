import axios from "axios";

const API_URL = "http://localhost:3000/api/rentals/";

export const getRentals = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createRental = async (rentalData) => {
  const response = await axios.post(API_URL, rentalData);
  return response.data;
}

// export const submitRentalDates = async (dates) => {
//   const response = await axios.post(`${API_URL}/dates`, dates);
//   return response.data;
// }

export const getActiveRentals = async () => {
  const response = await axios.get(`${API_URL}/active`);
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
