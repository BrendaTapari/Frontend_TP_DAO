import axios from "axios";

const API_URL = "http://localhost:3000/api/autos";

export const getAutos = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createAuto = async (autoData) => {
  const isFormData = autoData instanceof FormData;

  const config = {
    headers: {},
  };

  if (isFormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  const response = await axios.post(API_URL, autoData, config);
  return response.data;
};

export const updateCar = async (id, autoData) => {
  const response = await axios.put(`${API_URL}/${id}`, autoData);
  return response.data;
};

export const getAviableCars = async () => {
    const response = await axios.get(`${API_URL}/available`)
    return response.data
}

export const getRentedCars = async () => {
  const response = await axios.get(`${API_URL}/rented`);
  return response.data;
};

export const deleteCar = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};


export const getCarByPatente = async (patente) => {
  const response = await axios.get(`${API_URL}/${patente}`);
  return response.data;
};
