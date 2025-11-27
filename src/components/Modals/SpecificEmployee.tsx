import { useState, useEffect, useCallback } from "react";
import {
  getEmployeeById,
  deleteEmployee,
  updateEmployee,
} from "../../services/employeeService";
import {
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Save,
  X,
} from "lucide-react";

interface SpecificEmployeeProps {
  employeeLegajo: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

interface Employee {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  tipoDocumento?: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;
  fechaInicioActividad: string;
  legajo?: string;
  legajo_empleado?: string;
  direccion?: string;
  puesto?: string;
  salario?: string;
}

interface EditFormData {
  telefono: string;
  direccion: string;
  email: string;
  puesto: string;
  salario: string;
}

export default function SpecificEmployee({
  employeeLegajo,
  isOpen,
  onClose,
  onDelete,
  onEdit,
}: SpecificEmployeeProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    telefono: "",
    direccion: "",
    email: "",
    puesto: "",
    salario: "",
  });

  const fetchEmployee = useCallback(async () => {
    if (!employeeLegajo) return;

    setIsLoading(true);
    setError("");

    try {
      const employeeData = await getEmployeeById(employeeLegajo);
      setEmployee(employeeData);
    } catch (error) {
      console.error("Error fetching employee:", error);
      setError("Error al cargar la información del empleado");
    } finally {
      setIsLoading(false);
    }
  }, [employeeLegajo]);

  useEffect(() => {
    if (employeeLegajo && isOpen) {
      fetchEmployee();
    }
    // Reset state when modal closes
    if (!isOpen) {
      setEmployee(null);
      setIsEditing(false);
      setError("");
    }
  }, [employeeLegajo, isOpen, fetchEmployee]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDependencyError, setShowDependencyError] = useState(false);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!employee?.legajo_empleado) return;

    setIsDeleting(true);
    try {
      // Use legajo for deletion as requested
      const employeeId = employee.legajo_empleado;
      await deleteEmployee(employeeId);

      // Close modal and notify parent
      onClose();
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      if (error.response && error.response.status === 400) {
        setShowDependencyError(true);
      } else {
        setError("Error al eliminar el empleado");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleStartEditing = () => {
    if (employee) {
      setEditFormData({
        telefono: employee.telefono || "",
        direccion: employee.direccion || "",
        email: employee.email || "",
        puesto: employee.puesto || "",
        salario: employee.salario || "",
      });
      setIsEditing(true);
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!employee?.dni) return;

    setIsSaving(true);
    setError("");

    try {
      await updateEmployee(employee.dni, editFormData);
      await fetchEmployee(); // Refresh employee data
      setIsEditing(false);
      if (onEdit) {
        onEdit();
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      setError(
        "Error al actualizar el empleado. Por favor, intente nuevamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-AR");
    } catch {
      return dateString;
    }
  };

  const formatSalary = (salary?: string) => {
    if (!salary) return "No especificado";
    try {
      const numSalary = parseFloat(salary);
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(numSalary);
    } catch {
      return salary;
    }
  };

  const getPuestoColor = (puesto?: string) => {
    if (!puesto) return "badge-ghost";
    const colors: { [key: string]: string } = {
      Gerente: "badge-primary",
      Manager: "badge-primary",
      Supervisor: "badge-secondary",
      Empleado: "badge-accent",
      Vendedor: "badge-info",
      Recepcionista: "badge-success",
      default: "badge-ghost",
    };
    return colors[puesto] || colors["default"];
  };

  if (!isOpen) return null;

  return (
    <>
      <dialog className="modal modal-open">
        <div className="modal-box max-w-4xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl">Información del Empleado</h3>
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
          ) : employee ? (
            <div className="space-y-6">
              {/* Employee Header */}
              <div className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-20">
                          <User size={40} />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold">
                          {employee.nombre} {employee.apellido}
                        </h2>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-base-content/60">
                            ID: {employee.id}
                          </p>
                          {employee.legajo && (
                            <p className="text-base-content/60">
                              Legajo: {employee.legajo}
                            </p>
                          )}
                          {employee.puesto && (
                            <span
                              className={`badge ${getPuestoColor(
                                employee.puesto
                              )} badge-lg`}
                            >
                              {employee.puesto}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Personal Information */}
                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <CreditCard className="text-primary" size={20} />
                      <h4 className="font-semibold">Identificación</h4>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-base-content/60">DNI</p>
                        <p className="font-semibold">{employee.dni}</p>
                      </div>
                      {employee.legajo_empleado && (
                        <div>
                          <p className="text-sm text-base-content/60">
                            Legajo
                          </p>
                          <p className="font-semibold">
                            {employee.legajo_empleado}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Mail className="text-primary" size={20} />
                      <h4 className="font-semibold">Contacto</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail size={16} className="text-info" />
                        <div className="flex-1">
                          <p className="text-sm text-base-content/60">Email</p>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={editFormData.email}
                              onChange={handleInputChange}
                              className="input input-bordered input-sm w-full"
                            />
                          ) : (
                            <p className="font-semibold break-all">
                              {employee.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-success" />
                        <div className="flex-1">
                          <p className="text-sm text-base-content/60">
                            Teléfono
                          </p>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="telefono"
                              value={editFormData.telefono}
                              onChange={handleInputChange}
                              className="input input-bordered input-sm w-full"
                            />
                          ) : (
                            <p className="font-semibold">{employee.telefono}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {(employee.direccion || isEditing) && (
                  <div className="card bg-base-100 border border-base-300">
                    <div className="card-body p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <MapPin className="text-primary" size={20} />
                        <h4 className="font-semibold">Dirección</h4>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="direccion"
                          value={editFormData.direccion}
                          onChange={handleInputChange}
                          className="input input-bordered input-sm w-full"
                          placeholder="Ingrese la dirección"
                        />
                      ) : (
                        <p className="font-semibold">{employee.direccion}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Birth Date */}
                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Calendar className="text-primary" size={20} />
                      <h4 className="font-semibold">Fecha de Nacimiento</h4>
                    </div>
                    <p className="font-semibold text-lg">
                      {formatDate(employee.fechaNacimiento)}
                    </p>
                  </div>
                </div>

                {/* Start Date */}
                <div className="card bg-base-100 border border-base-300">
                  <div className="card-body p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="text-primary" size={20} />
                      <h4 className="font-semibold">Fecha de Inicio</h4>
                    </div>
                    <p className="font-semibold text-lg">
                      {formatDate(employee.fechaInicioActividad)}
                    </p>
                  </div>
                </div>

                {/* Puesto */}
                {(employee.puesto || isEditing) && (
                  <div className="card bg-base-100 border border-base-300">
                    <div className="card-body p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Briefcase className="text-primary" size={20} />
                        <h4 className="font-semibold">Puesto</h4>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="puesto"
                          value={editFormData.puesto}
                          onChange={handleInputChange}
                          className="input input-bordered input-sm w-full"
                          placeholder="Ingrese el puesto"
                        />
                      ) : (
                        <span
                          className={`badge ${getPuestoColor(
                            employee.puesto
                          )} badge-lg`}
                        >
                          {employee.puesto}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Salary */}
                {(employee.salario || isEditing) && (
                  <div className="card bg-base-100 border border-base-300">
                    <div className="card-body p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <DollarSign className="text-primary" size={20} />
                        <h4 className="font-semibold">Salario</h4>
                      </div>
                      {isEditing ? (
                        <input
                          type="number"
                          name="salario"
                          value={editFormData.salario}
                          onChange={handleInputChange}
                          className="input input-bordered input-sm w-full"
                          placeholder="Ingrese el salario"
                        />
                      ) : (
                        <p className="font-semibold text-lg text-success">
                          {formatSalary(employee.salario)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-base-300">
                {isEditing ? (
                  <>
                    <button
                      className="btn btn-ghost"
                      onClick={handleCancelEditing}
                      disabled={isSaving}
                    >
                      <X size={16} />
                      Cancelar
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                    >
                      <Save size={16} />
                      {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={handleStartEditing}
                      disabled={isDeleting}
                    >
                      <Edit size={16} />
                      Editar Empleado
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 size={16} />
                      {isDeleting ? "Eliminando..." : "Eliminar Empleado"}
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-base-content/60">
                No se pudo cargar la información del empleado
              </p>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={onClose}>close</button>
        </form>
      </dialog>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && employee && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Está seguro que desea eliminar al empleado con Legajo <strong>{employee.legajo_empleado}</strong>?
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
              Este empleado tiene alquileres asociados y no puede ser eliminado.
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
