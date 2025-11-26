import axios from 'axios';

const API_URL = 'http://localhost:3000/employees';

export const getEmployees = async () => {
    const response = await axios.get(`${API_URL}/`)
    return response.data
}

export const createEmployee = async (employeeData) => {
    const response = await axios.post(`${API_URL}/create`, employeeData)
    return response.data
}

export const updateEmployee = async (employeeDni, employeeData) => {
    const response = await axios.patch(`${API_URL}/${employeeDni}`, employeeData)
    return response.data
}

export const deleteEmployee = async (legajoEmpleado) => {
    const response = await axios.delete(`${API_URL}/${legajoEmpleado}`)
    return response.data
}

export const getEmployeeById = async (legajoEmpleado) => {
    const response = await axios.get(`${API_URL}/${legajoEmpleado}`)
    return response.data
}