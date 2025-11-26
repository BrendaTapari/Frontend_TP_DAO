import { useState, useEffect } from "react";
import {
  Car,
  Calendar,
  Palette,
  DollarSign,
  Hash,
  Factory,
  X,
  Edit2,
  Shield,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Trash2,
} from "lucide-react";
import { getCarByPatente, updateCar, getStates, deleteCar } from "../../services/autosService";
import { fetchOrdenesByAuto } from "../../services/maintenanceService";
import CoveredCarImage from "../../images/CoveredCar.png";

interface SpecificCarProps {
  carId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (carPatente: string) => void;
  onUpdate?: () => void;
}

interface Cliente {
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface Empleado {
  legajo: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface Alquiler {
  id_alquiler: number;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  cliente: Cliente;
  empleado: Empleado;
  sanciones: any[];
}

interface Mantenimiento {
  id_mantenimiento: number;
  precio: number;
  descripcion: string;
}

interface OrdenMantenimiento {
  id_orden: number;
  fecha_inicio: string;
  fecha_fin: string;
  mantenimientos: Mantenimiento[];
}

interface Estado {
  id_estado: number;
  nombre: string;
  ambito: string;
}

interface Seguro {
  descripcion: string;
  costo: number;
  tipo_descripcion: string;
}

interface CarData {
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  costo: number;
  periodicidadMantenimineto: number;
  imagen?: string;
  estado?: Estado | null;
  seguro?: Seguro | null;
  historial_alquileres?: Alquiler[];
  historial_mantenimientos?: OrdenMantenimiento[];
}

export default function SpecificCar({
  carId,
  isOpen,
  onClose,
  onUpdate,
}: SpecificCarProps) {
  const [car, setCar] = useState<CarData | null>(null);
  const [maintenanceOrders, setMaintenanceOrders] = useState<OrdenMantenimiento[]>([]);
  const [showDependencyError, setShowDependencyError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [availableStates, setAvailableStates] = useState<Estado[]>([]);
  const [editForm, setEditForm] = useState({
    estadoId: 0,
    costo: 0,
    periodicidadMantenimiento: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && carId) {
      fetchCar();
    }
  }, [isOpen, carId]);

  const fetchCar = async () => {
    if (!carId) return;

    setLoading(true);
    setError("");

    try {
      const carResponse = await getCarByPatente(carId);
      setCar(carResponse);

      try {
        const maintenanceResponse = await fetchOrdenesByAuto(carId);
        
        if (Array.isArray(maintenanceResponse)) {
          setMaintenanceOrders(maintenanceResponse);
        } else if (maintenanceResponse && Array.isArray(maintenanceResponse.ordenes)) {
          setMaintenanceOrders(maintenanceResponse.ordenes);
        } else {
          setMaintenanceOrders([]);
        }
      } catch (maintenanceError: any) {
        if (maintenanceError.response && maintenanceError.response.status === 404) {
          setMaintenanceOrders([]);
        } else {
          console.error("Error fetching maintenance history:", maintenanceError);
        }
      }

    } catch (error) {
      console.error("Error fetching car details:", error);
      setError("Error al cargar la información del auto");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!car) return;
    
    setIsEditing(true);

    try {
      const states = await getStates();
      setAvailableStates(states);

      // Try to find the current state ID
      // If car.estado has an ID, use it. Otherwise try to match by name.
      let currentEstadoId = car.estado?.id_estado || 0;
      
      if (!currentEstadoId && car.estado?.nombre) {
        const matchingState = states.find((s: Estado) => 
          s.nombre.toLowerCase() === car.estado?.nombre.toLowerCase()
        );
        if (matchingState) {
          currentEstadoId = matchingState.id_estado;
        }
      }

      setEditForm({
        estadoId: currentEstadoId,
        costo: car.costo,
        periodicidadMantenimiento: car.periodicidadMantenimineto
      });

    } catch (error) {
      console.error("Error fetching states:", error);
      setError("Error al cargar los estados disponibles");
      // Fallback initialization
      setEditForm({
        estadoId: car.estado?.id_estado || 0,
        costo: car.costo,
        periodicidadMantenimiento: car.periodicidadMantenimineto
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
  };

  const handleSave = async () => {
    if (!car || !carId) return;

    setIsSaving(true);
    setError("");

    try {
      await updateCar(
        carId,
        editForm.estadoId,
        editForm.costo,
        editForm.periodicidadMantenimiento
      );
      
      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error("Error updating car:", error);
      setError("Error al actualizar el auto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!car) return;
    
    setIsDeleting(true);
    try {
      await deleteCar(car.patente);
      setShowDeleteModal(false);
      if (onUpdate) {
        onUpdate();
      }
      onClose();
    } catch (error) {
      console.error("Error deleting car:", error);
      if (error.response && error.response.status === 400) {
        setShowDependencyError(true);
      } else {
        setError("Error al eliminar el auto");
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getImageUrl = () => {
    if (car?.imagen) {
      return `data:image/jpeg;base64,${car.imagen}`;
    }

    return CoveredCarImage;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  const getMaintenanceText = (days: number) => {
    if (days >= 365) return `${Math.floor(days / 365)} año(s)`;
    if (days >= 30) return `${Math.floor(days / 30)} mes(es)`;
    return `${days} días`;
  };

  const getEstadoBadgeColor = (estado: string | null | undefined) => {
    if (!estado) return "badge-neutral";

    switch (estado.toLowerCase()) {
      case "disponible":
        return "badge-success";
      case "alquilado":
        return "badge-warning";
      case "mantenimiento":
        return "badge-error";
      default:
        return "badge-neutral";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal modal-open">
        <div className="modal-box bg-gradient-to-b from-gray-100 to-gray-200 max-w-4xl max-h-[95vh] p-0 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b   top-0 z-20 shadow-sm">
            <h3 className="font-bold text-xl text-gray-800">Detalles del Auto</h3>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(95vh-5rem)]">
            {loading && (
              <div className="flex justify-center items-center p-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            {error && (
              <div className="alert alert-error m-6">
                <span>{error}</span>
              </div>
            )}

            {car && (
              <div className="card shadow-sm">
                <figure className="h-90 overflow-hidden flex items-center justify-center  top-0 z-10">
                  <img
                    src={getImageUrl()}
                    alt={`${car.marca} ${car.modelo}`}
                    className="w-[150%] h-[150%] object-contain relative z-10 drop-shadow-lg scale-130"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                </figure>

                <div className="card-body p-8">
                  <h2 className="card-title text-2xl text-gray-800 mb-6">
                    <Car className="w-8 h-8" />
                    {car.marca} {car.modelo}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-300">
                      <Hash className="w-5 h-5 text-gray-600" />
                      <div>
                        <span className="font-medium text-sm text-gray-700">
                          Patente:
                        </span>
                        <div className="badge badge-outline font-mono text-base text-gray-800">
                          {car.patente}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-300">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <div>
                        <span className="font-medium text-sm text-gray-700">
                          Año:
                        </span>
                        <div className="text-base font-semibold text-gray-800">
                          {car.anio}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-300">
                      <Palette className="w-5 h-5 text-gray-600" />
                      <div>
                        <span className="font-medium text-sm text-gray-700">
                          Color:
                        </span>
                        <div className="text-base font-semibold capitalize text-gray-800">
                          {car.color}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-300">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                      <div className="w-full">
                        <span className="font-medium text-sm text-gray-700">
                          Costo:
                        </span>
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="input input-bordered input-sm w-full mt-1"
                            value={editForm.costo}
                            onChange={(e) => setEditForm({...editForm, costo: parseFloat(e.target.value)})}
                          />
                        ) : (
                          <div className="text-base font-semibold text-success">
                            {formatPrice(car.costo)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-300">
                      <Factory className="w-5 h-5 text-gray-600" />
                      <div className="w-full">
                        <span className="font-medium text-sm text-gray-700">
                          Mantenimiento (días):
                        </span>
                        {isEditing ? (
                          <input 
                            type="number" 
                            className="input input-bordered input-sm w-full mt-1"
                            value={editForm.periodicidadMantenimiento}
                            onChange={(e) => setEditForm({...editForm, periodicidadMantenimiento: parseInt(e.target.value)})}
                          />
                        ) : (
                          <div className="badge badge-info text-sm">
                            Cada {getMaintenanceText(car.periodicidadMantenimineto)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-300">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg text-gray-800">
                        <CheckCircle className="w-5 h-5" />
                        Estado
                      </h4>
                      {isEditing ? (
                        <div className="space-y-2">
                           <select 
                              className="select select-bordered select-sm w-full"
                              value={editForm.estadoId}
                              onChange={(e) => setEditForm({...editForm, estadoId: parseInt(e.target.value)})}
                            >
                              <option value={0} disabled>Seleccionar estado</option>
                              {availableStates.map(state => (
                                <option key={state.id_estado} value={state.id_estado}>
                                  {state.nombre}
                                </option>
                              ))}
                            </select>
                        </div>
                      ) : car.estado ? (
                        <div className="space-y-2">
                          <span
                            className={`badge badge-lg ${getEstadoBadgeColor(
                              car.estado.nombre
                            )}`}
                          >
                            {car.estado.nombre}
                          </span>
                          <p className="text-sm text-gray-700">
                            <strong>Ámbito:</strong> {car.estado.ambito}
                          </p>
                        </div>
                      ) : (
                        <span className="badge badge-neutral badge-lg">
                          No disponible
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg text-gray-800">
                        <Shield className="w-5 h-5" />
                        Seguro
                      </h4>
                      {car.seguro ? (
                        <div className="space-y-2">
                          <p className="font-medium text-base">
                            {car.seguro.descripcion}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>{car.seguro.tipo_descripcion}</strong>
                          </p>
                          <p className="text-success font-semibold">
                            {formatPrice(car.seguro.costo)}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-600">Sin información de seguro</p>
                      )}
                    </div>
                  </div>

                  {/* Historial - Colapsible */}
                  <div className="collapse collapse-arrow bg-white mb-6 border border-gray-300 shadow-sm">
                    <input type="checkbox" />
                    <div className="collapse-title text-xl font-medium flex items-center gap-3 py-4 text-gray-800">
                      <Users className="w-6 h-6" />
                      Historial de Alquileres (
                      {car.historial_alquileres?.length || 0})
                    </div>
                    <div className="collapse-content">
                      {!car.historial_alquileres ||
                      car.historial_alquileres.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          Sin alquileres registrados
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {car.historial_alquileres.map((alquiler) => (
                            <div
                              key={alquiler.id_alquiler}
                              className="border rounded-lg p-3 bg-base-100"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-success">
                                  {formatPrice(alquiler.precio)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ID: #{alquiler.id_alquiler}
                                </span>
                              </div>
                              <p className="text-sm flex items-center gap-1 mb-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(alquiler.fecha_inicio)} -{" "}
                                {formatDate(alquiler.fecha_fin)}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Cliente:</span>{" "}
                                {alquiler.cliente.nombre}{" "}
                                {alquiler.cliente.apellido}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">DNI:</span>{" "}
                                {alquiler.cliente.dni.toLocaleString()}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Empleado:</span>{" "}
                                {alquiler.empleado.nombre}{" "}
                                {alquiler.empleado.apellido}
                              </p>
                              {alquiler.sanciones.length > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                  <AlertTriangle className="w-3 h-3 text-warning" />
                                  <span className="text-xs text-warning">
                                    {alquiler.sanciones.length} sanción(es)
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Historial de Mantenimientos */}
                  <div className="collapse collapse-arrow bg-white mb-6 border border-gray-300 shadow-sm">
                    <input type="checkbox" />
                    <div className="collapse-title text-xl font-medium flex items-center gap-3 py-4 text-gray-800">
                      <Activity className="w-6 h-6" />
                      Historial de Mantenimientos (
                      {maintenanceOrders.length || 0})
                    </div>
                    <div className="collapse-content">
                      {!maintenanceOrders ||
                      maintenanceOrders.length === 0 ? (
                        <div className="alert alert-info bg-blue-50 border-blue-200 text-blue-800">
                          <AlertTriangle className="w-5 h-5" />
                          <span>Este auto todavía no ha recibido un mantenimiento.</span>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {maintenanceOrders.map((orden) => (
                            <div
                              key={orden.id_orden}
                              className="border rounded-lg p-3 bg-base-100"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  Orden #{orden.id_orden}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(orden.fecha_inicio)} -{" "}
                                  {formatDate(orden.fecha_fin)}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {orden.mantenimientos.map((mant) => (
                                  <div
                                    key={mant.id_mantenimiento}
                                    className="flex justify-between text-sm p-2 bg-base-200 rounded"
                                  >
                                    <span>{mant.descripcion}</span>
                                    <span className="font-medium text-success">
                                      {formatPrice(mant.precio)}
                                    </span>
                                  </div>
                                ))}
                                <div className="text-right pt-1 border-t">
                                  <span className="font-semibold">
                                    Total:{" "}
                                    {formatPrice(
                                      orden.mantenimientos.reduce(
                                        (sum, m) => sum + m.precio,
                                        0
                                      )
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="card-actions justify-end mt-8 pt-6 border-t border-gray-300 gap-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            className="btn btn-success btn-md text-white"
                            disabled={isSaving}
                          >
                            {isSaving ? <span className="loading loading-spinner loading-xs"></span> : null}
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn btn-ghost btn-md"
                            disabled={isSaving}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleEdit}
                            className="btn btn-outline btn-md"
                          >
                            <Edit2 size={18} />
                            Editar
                          </button>
                          <button
                            onClick={handleDeleteClick}
                            className="btn btn-error btn-outline btn-md"
                          >
                            <Trash2 size={18} />
                            Eliminar Auto
                          </button>
                          <button onClick={onClose} className="btn btn-primary btn-md">
                            Cerrar
                          </button>
                        </>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && car && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Confirmar Eliminación</h3>
            <p className="py-4">
              ¿Está seguro que desea eliminar el auto con patente <strong>{car.patente}</strong>?
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
              Este Auto tiene alquileres y/o mantenimientos asociados y no puede ser eliminado.
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
