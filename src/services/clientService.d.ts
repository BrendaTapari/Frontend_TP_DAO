// Type declarations for clientService.js

export interface Client {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion?: string;
}

export interface CreateClientPayload {
  nombre: string;
  apellido: string;
  DNI: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  direccion: string;
}

export interface UpdateClientPayload {
  email: string;
  telefono: number;
  direccion?: string;
}

export function getClients(): Promise<Client[]>;
export function createClient(clientData: CreateClientPayload): Promise<Client>;
export function updateClient(id: number, clientData: UpdateClientPayload): Promise<Client>;
export function deleteClient(id: number): Promise<void>;
export function getAvailableClients(): Promise<Client[]>;
export function getClientById(id: number): Promise<Client>;
