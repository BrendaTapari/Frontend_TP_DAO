import { getClients } from "../../services/clientService";
import type { Client } from "../../services/clientService.d";
import { useEffect, useState } from "react";
import EditClient from "../Modals/EditClient";
import SpecificClient from "../Modals/SpecificClient";
import { Search } from "lucide-react";

export default function ClientsInfo() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  //const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const clients = await getClients();
      setClients(clients);
      setFilteredClients(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleEditSuccess = () => {
    fetchClients();
    setSelectedClient(null);
  };

  const filterClients = (term: string) => {
    if (!term.trim()) {
      setFilteredClients(clients);
      return;
    }

    const filtered = clients.filter((client: Client) => {
      const searchLower = term.toLowerCase();
      return (
        client.nombre?.toLowerCase().includes(searchLower) ||
        client.apellido?.toLowerCase().includes(searchLower) ||
        client.dni?.toString().includes(term)
      );
    });

    setFilteredClients(filtered);
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    filterClients(searchTerm);
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setSearchTerm(value);
    filterClients(value);
  };

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleCloseClientModal = () => {
    setShowClientModal(false);
  };

  const handleClientUpdated = () => {
    fetchClients();
  };

  return (
    <>
      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <div className="flex justify-between p-2">
          <div>
            <h3 className="text-xl font-bold">Información de Clientes</h3>
          </div>
          <div className="join">
            <div>
              <label className="input validator join-item">
                <Search className="mx-2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o DNI..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                />
              </label>
              <div className="validator-hint hidden">
                Ingrese parametro de busqueda
              </div>
            </div>
            <button
              className="btn btn-neutral join-item"
              onClick={handleSearch}
            >
              Buscar
            </button>
          </div>
        </div>
        <table className="table rounded-2xl">
          <thead className="bg-primary/25">
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Fecha Nacimiento</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients && filteredClients.length > 0 ? (
              filteredClients.map((client: Client, index: number) => (
                <tr
                  key={client.id}
                  className="hover:bg-base-200 cursor-pointer transition-colors"
                  onDoubleClick={() => handleViewClient(client)}
                  title="Doble click para ver detalles"
                >
                  <th>{index + 1}</th>
                  <td>{client.nombre}</td>
                  <td>{client.apellido}</td>
                  <td>{client.dni_cliente}</td>
                  <td>{client.email}</td>
                  <td>{client.telefono}</td>
                  <td>{client.fechaNacimiento}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-4">
                  {searchTerm
                    ? "No se encontraron clientes con ese criterio de búsqueda"
                    : "No hay clientes disponibles"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>  
      
      {selectedClient && (
        <SpecificClient
          client={selectedClient}
          isOpen={showClientModal}
          onClose={handleCloseClientModal}
          onDelete={handleClientUpdated}
          onEdit={handleClientUpdated}
        />
      )}
    </>
  );
}
