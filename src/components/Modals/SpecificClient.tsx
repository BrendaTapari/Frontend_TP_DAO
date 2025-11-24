import { useState, useEffect } from "react";
import { deleteClient } from "../../services/clientService";
import EditClient from "./EditClient";
import {
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
} from "lucide-react";

interface SpecificClientProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

interface Client {
  id: number;
  nombre: string;
  apellido: string;
  dni: number;
  email: string;
  telefono: number;
  fechaNacimiento: string;
  direccion: string;
}

export default function SpecificClient({
  client,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}: SpecificClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!client?.id) return;

    const confirmDelete = window.confirm(
      `¿Está seguro que desea eliminar al cliente ${client.nombre} ${client.apellido}?`,
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteClient(client.id);

      onClose();
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      setError("Error al eliminar el cliente");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    if (onEdit) {
      onEdit();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog className="modal modal-open">
        <div className="modal-box max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl">Información del Cliente</h3>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : client ? (
            <div className="space-y-6">
              {/* Client Header */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-center space-x-4">
                    <div className="avatar placeholder">
                      <div className="bg-neutral text-neutral-content rounded-full w-16">
                        <User size={32} />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {client.nombre} {client.apellido}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="text-primary" size={20} />
                      <div>
                        <p className="text-sm text-base-content/60">DNI</p>
                        <p className="font-semibold">{client.dni_cliente}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="text-primary" size={20} />
                      <div>
                        <p className="text-sm text-base-content/60">Email</p>
                        <p className="font-semibold">{client.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-center space-x-3">
                      <Phone className="text-primary" size={20} />
                      <div>
                        <p className="text-sm text-base-content/60">Teléfono</p>
                        <p className="font-semibold">{client.telefono}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="text-primary" size={20} />
                      <div>
                        <p className="text-sm text-base-content/60">
                          Fecha de Nacimiento
                        </p>
                        <p className="font-semibold">
                          {new Date(client.fechaNacimiento).toLocaleDateString(
                            "es-AR",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-base-300">
                  <EditClient client={client} onSuccess={handleEditSuccess} />
                <button
                  className="btn btn-error"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 size={16} />
                  {isDeleting ? "Eliminando..." : "Eliminar Cliente"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-base-content/60">
                No se pudo cargar la información del cliente
              </p>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={onClose}>close</button>
        </form>
      </dialog>

    </>
  );
}
