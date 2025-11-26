import { useState } from "react";
import { deleteClient } from "../../services/clientService";
import EditClient from "./EditClient";
import {
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
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDependencyError, setShowDependencyError] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!(client as any)?.dni_cliente) return;

    setIsDeleting(true);
    try {
      const clientId = (client as any).dni_cliente;
      await deleteClient(clientId);

      onClose();
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      console.error("Error deleting client:", error);
      if (error.response && error.response.status === 400) {
        setShowDependencyError(true);
      } else {
        setError("Error al eliminar el cliente");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditSuccess = () => {
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

          {client ? (
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
                        <p className="font-semibold">{(client as any).dni_cliente || client.dni}</p>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && client && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Está seguro que desea eliminar al cliente con DNI <strong>{(client as any).dni_cliente || client.dni}</strong>?
            </p>
            <div className="modal-action">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-error" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <span className="loading loading-spinner loading-xs"></span> : null}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Error Modal */}
      {showDependencyError && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-warning">No se puede eliminar</h3>
            <p className="py-4">
              Este cliente tiene alquileres asociados y no puede ser eliminado.
            </p>
            <div className="modal-action">
              <button 
                className="btn" 
                onClick={() => setShowDependencyError(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
