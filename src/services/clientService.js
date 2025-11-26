import axios from "axios";

const API_URL = "http://localhost:3000/clients";

export const getClients = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createClient = async (clientData) => {
  const response = await axios.post(`${API_URL}/create`, clientData);
  return response.data;
};

export const updateClient = async (id, clientData) => {
  const response = await axios.put(`${API_URL}/editClient`, clientData);
  return response.data;
};

export const deleteClient = async (dniCliente) => {
  const response = await axios.delete(`${API_URL}/${dniCliente}`);
  return response.data;
};

export const getAvailableClients = async () => {
  const response = await axios.get(`${API_URL}/available`);
  return response.data;
}

export const getClientByDni = async (dni) => {
    const response = await axios.get(`${API_URL}/specific?dni=${dni}`);
    return response.data;
}

