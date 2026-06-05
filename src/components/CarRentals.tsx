import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { getActiveRentals, getRentals } from "../services/rentalService";
import { ArrowLeft, Plus } from "lucide-react";
import { useVisibleFocus } from "../hooks/useVisibleFocus";
import { useTranslation } from "react-i18next";

interface Auto {
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
  const [rentalsHistory, setRentalsHistory] = useState<Rental[]>([]);
  const [showInfoRental, setShowInfoRental] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allRentals, setAllRentals] = useState<boolean>(false);
  const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
  const [isSpecificRentalOpen, setIsSpecificRentalOpen] =
    useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Activar navegación TAB solo en elementos visibles
  useVisibleFocus(containerRef, "button, a, tr, [role='row']");

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

  const handleRowKeyDown = (e: React.KeyboardEvent, rental: Rental) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedRental(rental);
      setIsSpecificRentalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsSpecificRentalOpen(false);
  };

  const fetchRentals = async () => {
    setIsLoading(true);
    try {
      const data = await getActiveRentals();
      setRentals(data);

      const dataHistory = await getRentals();
      setRentalsHistory(dataHistory);

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
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 p-6" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <button
                className="btn btn-ghost mb-4 text-sm font-medium focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                onClick={handleBackButton}
                aria-label={t('common.back')}
              >
                <ArrowLeft /> {t('rentals.back')}
              </button>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {t('rentals.title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                {t('rentals.description')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="btn btn-secondary text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                onClick={handleAddRental}
                aria-label={t('rentals.add_rental')}
              >
                <Plus />
                {t('rentals.add_rental')}
              </button>
              <button
                className="btn btn-warning text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                onClick={handleAddSancion}
                aria-label={t('rentals.add_sanctions')}
              >
                {t('rentals.add_sanctions')}
              </button>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" aria-label={t('rentals.rental_stats')}>
          <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">
              Total Alquileres
            </h3>
            <p className="text-3xl font-bold">{rentalsHistory.length}</p>
            <p className="text-blue-100 text-sm">Registrados en el sistema</p>
          </div>

          <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Alquileres Sin Sanciones</h3>
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
            <h3 className="text-lg font-semibold mb-2">Alquileres Con Sanciones</h3>
            <p className="text-3xl font-bold">
              {
                rentals.filter(
                  (rental: Rental) =>
                    rental.sanciones && rental.sanciones.length > 0
                ).length
              }
            </p>
            <p className="text-red-100 text-sm">Activos</p>
          </div>
        </section>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Lista de Alquileres Activos
            </h2>
            <button
              className={`btn ${
                showInfoRental ? "btn-error" : "btn-success"
              } rounded-lg font-medium transition-all focus:outline-2 focus:outline-offset-2 focus:outline-primary`}
              onClick={handleShowInfoRental}
              aria-label={showInfoRental ? "Ocultar tabla de alquileres activos" : "Mostrar tabla de alquileres activos"}
            >
              {showInfoRental ? "Ocultar Tabla" : "Mostrar Tabla"}
            </button>
          </div>
        </div>

        {/* Table Section */}
        {showInfoRental && (
          <section className="bg-white rounded-2xl shadow-xl overflow-hidden" aria-label="Tabla de alquileres activos">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full" role="table">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <th className="text-center font-bold text-sm">ID</th>
                    <th className="font-bold text-sm">Cliente</th>
                    <th className="font-bold text-sm">Costo</th>
                    <th className="font-bold text-sm">Vehículo</th>
                    <th className="font-bold text-sm">Fecha Inicio</th>
                    <th className="font-bold text-sm">Fecha Fin</th>
                    <th className="text-center font-bold text-sm">Sanciones</th>
                    <th className="text-center font-bold text-sm">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rentals && rentals.length > 0 ? (
                    rentals.map((rental: Rental, index: number) => (
                      <tr
                        key={rental.id || index}
                        className="hover:bg-gray-50 transition-colors cursor-pointer focus-within:bg-gray-100 focus:outline-none"
                        role="row"
                        tabIndex={0}
                        onDoubleClick={() => handleRowDoubleClick(rental)}
                        onKeyDown={(e) => handleRowKeyDown(e, rental)}
                        aria-label={`Alquiler ${rental.id}: Cliente ${rental.cliente.apellido}, Vehículo ${rental.vehiculo.modelo}, Estado ${rental.estado.nombre}`}
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
                            {rental.vehiculo.modelo || "No especificado"}
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
                        <td className="text-center">
                          <div
                            className={`badge ${
                              rental.estado.nombre === "En curso"
                                ? "badge-success"
                                : rental.estado.nombre === "Reservado"
                                ? "badge-warning"
                                : "badge-error"
                            }`}
                          >
                            {rental.estado.nombre}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
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
                            className="btn btn-primary mt-4 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                            onClick={handleAddRental}
                            aria-label="Agregar el primer alquiler de vehículo"
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
          </section>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Histórico de Alquileres 
            </h2>
            <button
              className={`btn ${
                allRentals ? "btn-warning" : "btn-success"
              } rounded-lg font-medium transition-all focus:outline-2 focus:outline-offset-2 focus:outline-primary`}
              onClick={handleSeeAllRentals}
              aria-label={allRentals ? "Ocultar tabla de histórico de alquileres" : "Mostrar tabla de histórico de alquileres"}
            >
              {allRentals ? "Ocultar Tabla" : "Mostrar Tabla"}
            </button>
          </div>
        </div>

      {allRentals ? (
        <section className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8" aria-label="Tabla histórico de alquileres">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full" role="table">
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
                  {rentalsHistory && rentalsHistory.length > 0 ? (
                    rentalsHistory.map((rental: Rental, index: number) => (
                      <tr
                        key={rental.id || index}
                        className="hover:bg-gray-50 transition-colors cursor-pointer focus-within:bg-gray-100 focus:outline-none"
                        role="row"
                        tabIndex={0}
                        onDoubleClick={() => handleRowDoubleClick(rental)}
                        onKeyDown={(e) => handleRowKeyDown(e, rental)}
                        aria-label={`Alquiler ${rental.id}: Cliente ${rental.cliente.apellido}, Vehículo ${rental.vehiculo.modelo}, Estado ${rental.estado.nombre}`}
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
                              rental.estado.nombre === "En curso"
                                ? "badge-success"
                                : rental.estado.nombre === "Reservado"
                                ? "badge-warning"
                                : "badge-error"
                            }`}
                          >
                            {rental.estado.nombre}
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
        </section>
        
        ) : (
        <div></div>
      )   }
    
      
      
      </div>
    
    </div>
  );
}
