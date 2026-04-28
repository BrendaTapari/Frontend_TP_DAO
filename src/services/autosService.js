import axios from "axios";
import mockCars from "../data/mockCars.json";

const API_URL = "http://localhost:3000/api/autos";

// Para usar mock data, descomenta la siguiente línea
const USE_MOCK_DATA = true;

export const getAutos = async () => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(mockCars);
  }
  const response = await axios.get(API_URL);
  return response.data;
};

export const getStates = async () => {
  const response = await axios.get(`http://localhost:3000/api/car/states`);
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

export const updateCar = async (
  patente,
  estado,
  costo,
  periodicidad_mantenimiento,
) => {
  const response = await axios.put(`${API_URL}/${patente}`, {
    estado,
    costo,
    periodicidad_mantenimiento,
  });
  return response.data;
};

export const getAviableCars = async () => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(
      mockCars.filter((car) => car.estado === "disponible"),
    );
  }
  const response = await axios.get(`${API_URL}/available`);
  return response.data;
};

export const getAviableCarsForRental = async (fechaInicio, fechaFin) => {
  const response = await axios.get(`${API_URL}/availableForRental`, {
    params: { fechaInicio, fechaFin },
  });
  return response.data;
};

export const getRentedCars = async () => {
  if (USE_MOCK_DATA) {
    return Promise.resolve(
      mockCars.filter((car) => car.estado === "en_alquiler"),
    );
  }
  const response = await axios.get(`${API_URL}/rented`);
  return response.data;
};

export const deleteCar = async (patente) => {
  const response = await axios.delete(`${API_URL}/${patente}`);
  return response.data;
};

export const getCarByPatente = async (patente) => {
  if (USE_MOCK_DATA) {
    const car = mockCars.find((car) => car.patente === patente);
    return Promise.resolve(car);
  }
  const response = await axios.get(`${API_URL}/${patente}`);
  return response.data;
};
