import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { getActiveRentals, getRentals } from "../services/rentalService";
import { ArrowLeft, Plus } from "lucide-react";
import SpecificRental from "./Modals/SpecificRental";

interface Auto {
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  costo: number;
  periodicidadMantenimineto: number;
  estado: { nombre: string };
  seguro: Seguro;
}

interface Cliente {
  nombre: string;
  apellido: string;
  direccion: string;
  fechaNacimiento: string;
  dni_cliente: number;
  telefono: string;
  email: string;
}

interface Empleado {
  nombre: string;
  apellido: string;
  direccion: string;
  fechaNacimiento: string;
  dni: number;
  telefono: string;
  email: string;
  legajo_empleado: string;
  puesto: string;
  salario: number;
  fechaInicioActividad: string;
}

interface Rental {
  id: number;
  vehiculo: Auto;
  fechaInicio: string;
  fechaFin: string;
  precio: number;
  cliente: Cliente;
  empleado: Empleado;
  sanciones: Sancion[];
  estado: string;
}

interface Sancion {
  id_sancion: number;
  costo_total: number;
  tipo_sancion: { descripcion: string };
  fecha: string;
  estado: { nombre: string };
}

interface Seguro {
  poliza: number;
  fechaVencimiento: string;
  tipoPoliza: { descripcion: string };
  compañia: string;
}

export default function CarRentals() {
  const [locations, setLocations] = useLocation();
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [showInfoRental, setShowInfoRental] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allRentals, setAllRentals] = useState<boolean>(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [isSpecificRentalOpen, setIsSpecificRentalOpen] =
    useState<boolean>(false);

  const handleBackButton = () => {
    setLocations("/");
  };

  const handleShowInfoRental = () => {
    setShowInfoRental(!showInfoRental);
  };

  const handleAddRental = () => {
    setLocations("/add-rental");
  };

  const handleAddSancion = () => {
    setLocations("/sanciones");
  };

  const formatCurrency = (amount: string | number) => {
    try {
      const numAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(numAmount);
    } catch {
      return amount;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-AR");
    } catch {
      return dateString;
    }
  };

  const getSancionBadge = (sancion: string) => {
    if (!sancion || sancion.toLowerCase() === "ninguna" || sancion === "") {
      return "badge-success";
    }
    return "badge-error";
  };

  const handleRowDoubleClick = (rental: Rental) => {
    setSelectedRental(rental);
    setIsSpecificRentalOpen(true);
  };

  const fetchRentals = async () => {
    setIsLoading(true);
    try {
      const data = await getActiveRentals();
      setRentals(data);

      if (selectedRental) {
        const updatedRental = data.find(
          (r: Rental) => r.id === selectedRental.id
        );
        if (updatedRental) {
          setSelectedRental(updatedRental);
        }
      }
    } catch (error) {
      console.error("Error fetching rentals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleRentalUpdate = () => {
    fetchRentals();
  };

  const handleSeeAllRentals = async () => {
    setIsLoading(true);
    setAllRentals(!allRentals);
    if (allRentals) {
      try {
        const data = await getRentals();
        setRentals(data);
      } catch (error) {
        console.error("Error fetching all rentals:", error);
      }
      console.log("Mostrando todos los alquileres: ", allRentals);
    
    }}

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <button
                className="btn btn-ghost mb-4 text-sm font-medium"
                onClick={handleBackButton}
              >
                <ArrowLeft /> Volver al inicio
              </button>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                Gestión de Alquileres
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Administra y visualiza todos los alquileres de vehículos
                registrados en el sistema. Controla fechas, costos y sanciones
                de manera eficiente.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="btn btn-secondary text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                onClick={handleAddRental}
              >
                <Plus />
                Nuevo Alquiler
              </button>
              <button
                className="btn btn-warning text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                onClick={handleAddSancion}
              >
                Gestionar Sanciones
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              Total Alquileres Activos
            </h3>
            <p className="text-3xl font-bold">{rentals.length}</p>
            <p className="text-blue-100 text-sm">Registrados en el sistema</p>
          </div>

          <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Sin Sanciones</h3>
            <p className="text-3xl font-bold">
              {
                rentals.filter(
                  (rental: Rental) =>
                    !rental.sanciones || rental.sanciones.length === 0
                ).length
              }
            </p>
            <p className="text-green-100 text-sm">Activos</p>
          </div>

          <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Con Sanciones</h3>
            <p className="text-3xl font-bold">
              {
                rentals.filter(
                  (rental: Rental) =>
                    rental.sanciones && rental.sanciones.length > 0
                ).length
              }
            </p>
            <p className="text-red-100 text-sm">Requieren atención</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Lista de Alquileres
            </h2>
            <button
              className={`btn ${
                showInfoRental ? "btn-error" : "btn-success"
              } rounded-lg font-medium transition-all`}
              onClick={handleShowInfoRental}
            >
              {showInfoRental ? "Ocultar Tabla" : "Mostrar Tabla"}
            </button>
          </div>
        </div>

        {/* Table Section */}
        {showInfoRental && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <th className="text-center font-bold text-sm">ID</th>
                    <th className="font-bold text-sm">Cliente</th>
                    <th className="font-bold text-sm">Costo</th>
                    <th className="font-bold text-sm">Vehículo</th>
                    <th className="font-bold text-sm">Fecha Inicio</th>
                    <th className="font-bold text-sm">Fecha Fin</th>
                    <th className="text-center font-bold text-sm">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals && rentals.length > 0 ? (
                    rentals.map((rental: Rental, index: number) => (
                      <tr
                        key={rental.id || index}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onDoubleClick={() => handleRowDoubleClick(rental)}
                      >
                        <td className="text-center font-semibold text-gray-700">
                          <div className="badge badge-outline">
                            {rental.id || `#${index + 1}`}
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold text-gray-800">
                            {rental.cliente.apellido +
                              " (" +
                              rental.cliente.dni_cliente +
                              ")" || "N/A"}
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-green-600">
                            {formatCurrency(rental.precio)}
                          </div>
                        </td>
                        <td>
                          <div className="font-medium text-gray-700">
                            {rental.vehiculo.modelo +
                              " (" +
                              rental.vehiculo.patente +
                              ")" || "No especificado"}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">
                              {formatDate(rental.fechaInicio)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">
                              {formatDate(rental.fechaFin)}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          {!rental.sanciones ||
                          rental.sanciones.length === 0 ? (
                            <span className="badge badge-success font-medium">
                              Sin sanciones
                            </span>
                          ) : (
                            <span className="badge badge-error font-medium">
                              Con sanción
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="text-6xl">🚗</div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                              No hay alquileres registrados
                            </h3>
                            <p className="text-gray-500">
                              Comienza agregando tu primer alquiler de vehículo
                            </p>
                          </div>
                          <button
                            className="btn btn-primary mt-4"
                            onClick={handleAddRental}
                          >
                            Agregar Primer Alquiler
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Lista de Alquileres
            </h2>
            <button
              className={`btn ${
                allRentals ? "btn-warning" : "btn-success"
              } rounded-lg font-medium transition-all`}
              onClick={handleSeeAllRentals}
            >
              {allRentals ? "Ocultar Tabla" : "Mostrar Tabla"}
            </button>
          </div>
        </div>

      {allRentals ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">  
                  <th className="text-center font-bold text-sm">ID</th>
                  <th className="font-bold text-sm">Cliente</th>
                  <th className="font-bold text-sm">Costo</th>
                  <th className="font-bold text-sm">Vehículo</th>
                  <th className="font-bold text-sm">Fecha Inicio</th>
                  <th className="font-bold text-sm">Fecha Fin</th>
                  <th className="text-center font-bold text-sm">Estado</th>
                </tr>
              </thead>  
              <tbody>
                  {rentals && rentals.length > 0 ? (
                    rentals.map((rental: Rental, index: number) => (
                      <tr
                        key={rental.id || index}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onDoubleClick={() => handleRowDoubleClick(rental)}
                      >
                        <td className="text-center font-semibold text-gray-700">
                          <div className="badge badge-outline">
                            {rental.id || `#${index + 1}`}
                          </div>
                        </td>
                        <td>
                          <div className="font-semibold text-gray-800">
                            {rental.cliente.apellido + " " + rental.cliente.nombre}
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-green-600">
                            {formatCurrency(rental.precio)}
                          </div>
                        </td>
                        <td>
                          <div className="font-medium text-gray-700">
                            {rental.vehiculo.modelo + " " + rental.vehiculo.marca}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">
                              {formatDate(rental.fechaInicio)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div className="font-medium text-gray-700">
                              {formatDate(rental.fechaFin)}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <div
                            className={`badge ${
                              rental.estado === "Activo"
                                ? "badge-success"
                                : rental.estado === "Pendiente"
                                ? "badge-warning"
                                : "badge-error"
                            }`}
                          >
                            {rental.estado}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No hay alquileres disponibles.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
        <div></div>
      )   }
    
      
      
    </div>
      <SpecificRental
        rental={selectedRental}
        isOpen={isSpecificRentalOpen}
        onClose={() => setIsSpecificRentalOpen(false)}
        onUpdate={handleRentalUpdate}
        />

    </div>
  );
}
