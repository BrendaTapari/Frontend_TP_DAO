import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { getClients } from "../../services/clientService";
import { getAviableCars } from "../../services/autosService";
import { getEmployees } from "../../services/employeeService";
import { createRental, carAvailable } from "../../services/rentalService";
import { useLocation } from "wouter";
import { ArrowLeft, Car, ChevronLeft, ChevronRight } from "lucide-react";
import type { Client } from "../../services/clientService.d";

interface CarOption {
  id: number;
  marca: string;
  modelo: string;
  patente: string;
  costo: number;
  imagen?: string;
  color?: string;
  año?: number;
}

interface EmployeeOption {
  id: number;
  legajo: string;
  nombre: string;
  apellido: string;
}

export default function CreateRental() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    cliente: "",
    costo: 0,
    auto: "",
    fechaInicio: "",
    fechaFin: "",
    empleado: "",
  });

  const [client, setClient] = useState<Client[]>([]);
  const [car, setCar] = useState<CarOption[]>([]);
  const [employee, setEmployee] = useState<EmployeeOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientData = await getClients();
        setClient(clientData);

        const carsData = await getAviableCars();
        setCar(carsData);

        const employeesData = await getEmployees();
        setEmployee(employeesData);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    const calculateCost = () => {
      if (!formData.fechaInicio || !formData.fechaFin || !formData.auto) {
        setFormData((prev) => ({ ...prev, costo: 0 }));
        return;
      }

      const start = new Date(formData.fechaInicio);
      const end = new Date(formData.fechaFin);

      if (start >= end) {
        setFormData((prev) => ({ ...prev, costo: 0 }));
        return;
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const selectedCar = car.find((c) => c.patente === formData.auto);
      if (selectedCar) {
        setFormData((prev) => ({
          ...prev,
          costo: diffDays * selectedCar.costo,
        }));
      }
    };

    calculateCost();
  }, [formData.fechaInicio, formData.fechaFin, formData.auto, car]);

  const handleVolver = () => {
    setLocation("/car-rentals");
  };

  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCarSelection = (patente: string) => {
    setFormData({ ...formData, auto: patente });
  };

  const handleDateValidation = async () => {
    if (!formData.fechaInicio || !formData.fechaFin) {
      setError("Por favor, seleccione ambas fechas (inicio y fin)");
      return false;
    }

    const fechaInicio = new Date(formData.fechaInicio);
    const fechaFin = new Date(formData.fechaFin);

    if (fechaInicio >= fechaFin) {
      setError("La fecha de inicio debe ser anterior a la fecha de fin");
      return false;
    }

    return true;
  };

  const handleNextStep = async () => {
    setError("");

    if (currentStep === 1) {
      const isValid = await handleDateValidation();
      if (isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (!formData.auto) {
        setError("Por favor, seleccione un auto");
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!formData.cliente || !formData.empleado) {
        setError("Por favor, seleccione cliente y empleado");
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const fechasValidas = await handleDateValidation();
    if (!fechasValidas) {
      return;
    }

    try {
      setIsLoading(true);

      const availability = await carAvailable(
        formData.auto,
        formData.fechaInicio,
        formData.fechaFin
      );
      if (!availability.available) {
        setError(
          "El vehículo no está disponible en las fechas seleccionadas. Por favor elija otro rango de fechas."
        );
        setIsLoading(false);
        return;
      }

      // Encontrar los IDs reales para enviar al backend
      const selectedClient = client.find(
        (c) => `${c.nombre} ${c.apellido}` === formData.cliente
      );
      const selectedEmployee = employee.find(
        (e) => `${e.nombre} ${e.apellido}` === formData.empleado
      );

      // Preparar datos para el backend con los identificadores correctos
      const rentalData = {
        ...formData,
        cliente: selectedClient?.dni || selectedClient?.id || formData.cliente,
        empleado:
          selectedEmployee?.legajo || selectedEmployee?.id || formData.empleado,
      };

      await createRental(rentalData);
      setLocation("/car-rentals");
    } catch (error) {
      console.error("Error creating rental:", error);
      setError("Error al crear el alquiler");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Selecciona las fechas
            </h2>
            <div className="flex gap-4 justify-center">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Fecha desde:</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full max-w-xs"
                  value={formData.fechaInicio}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, fechaInicio: e.target.value })
                  }
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Fecha hasta:</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full max-w-xs"
                  value={formData.fechaFin}
                  min={
                    formData.fechaInicio ||
                    new Date().toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, fechaFin: e.target.value })
                  }
                />
              </div>
            </div>
            {formData.fechaInicio && formData.fechaFin && (
              <div className="text-center">
                <div className="stat bg-base-200 rounded-lg inline-block">
                  <div className="stat-title">Duración del alquiler</div>
                  <div className="stat-value text-primary">
                    {Math.ceil(
                      (new Date(formData.fechaFin).getTime() -
                        new Date(formData.fechaInicio).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    días
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Selecciona el auto
            </h2>

            {car?.length === 0 ? (
              <div className="text-center">
                <p className="text-lg text-gray-500">
                  No hay autos disponibles
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {car?.map((carItem) => (
                  <div
                    key={carItem.patente}
                    className={`card bg-base-100 w-full shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      formData.auto === carItem.patente
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:scale-105"
                    }`}
                    onClick={() => handleCarSelection(carItem.patente)}
                  >
                    <figure className="h-48 bg-gray-100 overflow-hidden">
                      {carItem.imagen ? (
                        <img
                          src={carItem.imagen}
                          alt={`${carItem.marca} ${carItem.modelo}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/images/car-placeholder.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <Car size={64} className="text-gray-400" />
                        </div>
                      )}
                    </figure>
                    <div className="card-body p-4">
                      <h2 className="card-title text-lg">
                        {carItem.marca} {carItem.modelo}
                      </h2>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Patente:</span>{" "}
                          {carItem.patente}
                        </p>
                        {carItem.año && (
                          <p>
                            <span className="font-medium">Año:</span>{" "}
                            {carItem.año}
                          </p>
                        )}
                        {carItem.color && (
                          <p>
                            <span className="font-medium">Color:</span>{" "}
                            {carItem.color}
                          </p>
                        )}
                        <p className="text-lg font-bold text-success">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(carItem.costo)}
                          /día
                        </p>
                      </div>
                      <div className="card-actions justify-end mt-4">
                        <button
                          className={`btn ${
                            formData.auto === carItem.patente
                              ? "btn-success"
                              : "btn-primary"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCarSelection(carItem.patente);
                          }}
                        >
                          {formData.auto === carItem.patente
                            ? "Seleccionado"
                            : "Alquilar"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.auto && formData.fechaInicio && formData.fechaFin && (
              <div className="text-center mt-8">
                <div className="stat bg-base-200 rounded-lg inline-block">
                  <div className="stat-title">Costo total estimado</div>
                  <div className="stat-value text-success">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(formData.costo)}
                  </div>
                  <div className="stat-desc">
                    {Math.ceil(
                      (new Date(formData.fechaFin).getTime() -
                        new Date(formData.fechaInicio).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    días de alquiler
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Selecciona cliente y empleado
            </h2>
            <div className="flex gap-4 justify-center">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Cliente:</span>
                </label>
                <select
                  className="select select-bordered w-full max-w-xs"
                  name="cliente"
                  value={formData.cliente}
                  onChange={handleFormChange}
                  disabled={isLoading}
                >
                  <option value="">Seleccione un cliente</option>
                  {client?.map((clientItem) => (
                    <option
                      key={clientItem.id}
                      value={`${clientItem.nombre} ${clientItem.apellido}`}
                    >
                      {clientItem.nombre} {clientItem.apellido}
                    </option>
                  ))}
                  {client?.length === 0 && (
                    <option disabled>No hay clientes registrados</option>
                  )}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Empleado:</span>
                </label>
                <select
                  className="select select-bordered w-full max-w-xs"
                  name="empleado"
                  value={formData.empleado}
                  onChange={handleFormChange}
                  disabled={isLoading}
                >
                  <option value="">Seleccione un empleado</option>
                  {employee?.map((employeeItem) => (
                    <option
                      key={employeeItem.id}
                      value={`${employeeItem.nombre} ${employeeItem.apellido}`}
                    >
                      {employeeItem.legajo} - {employeeItem.nombre}{" "}
                      {employeeItem.apellido}
                    </option>
                  ))}
                  {employee?.length === 0 && (
                    <option disabled>No hay empleados registrados</option>
                  )}
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        const selectedCar = car.find((c) => c.patente === formData.auto);

        // Buscar cliente por nombre completo
        const selectedClient = client.find(
          (c) => `${c.nombre} ${c.apellido}` === formData.cliente
        );

        // Buscar empleado por nombre completo
        const selectedEmployee = employee.find(
          (e) => `${e.nombre} ${e.apellido}` === formData.empleado
        );

        return (
          <div className="space-y-6">        

            <div className="card bg-base-200 shadow-xl max-w-2xl mx-auto">
              <div className="card-body">
                <h3 className="card-title">Resumen del alquiler</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Fechas:</p>
                      <p>
                        Desde:{" "}
                        {new Date(formData.fechaInicio).toLocaleDateString()}
                      </p>
                      <p>
                        Hasta:{" "}
                        {new Date(formData.fechaFin).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Auto:</p>
                      <p>
                        {selectedCar?.marca} {selectedCar?.modelo}
                      </p>
                      <p>Patente: {selectedCar?.patente}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Cliente:</p>
                      <p>
                        {selectedClient?.nombre && selectedClient?.apellido
                          ? `${selectedClient.nombre} ${selectedClient.apellido}`
                          : "No encontrado"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Empleado:</p>
                      <p>
                        {selectedEmployee?.nombre && selectedEmployee?.apellido
                          ? `${selectedEmployee.nombre} ${selectedEmployee.apellido}`
                          : "No encontrado"}
                      </p>
                    </div>
                  </div>
                  <div className="divider"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      Total:{" "}
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(formData.costo)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          className="btn btn-circle btn-neutral tooltip"
          data-tip="Volver"
          onClick={handleVolver}
        >
          <ArrowLeft />
        </button>
        <h1 className="font-semibold text-3xl">Registrar Alquiler</h1>
      </div>

      {/* Steps Progress */}
      <div className="flex justify-center mb-8">
        <ul className="steps steps-vertical lg:steps-horizontal">
          <li className={`step ${currentStep >= 1 ? "step-primary" : ""}`}>
            Elegir fecha
          </li>
          <li className={`step ${currentStep >= 2 ? "step-primary" : ""}`}>
            Elegir auto
          </li>
          <li className={`step ${currentStep >= 3 ? "step-primary" : ""}`}>
            Elegir cliente y vendedor
          </li>
          <li className={`step ${currentStep >= 4 ? "step-primary" : ""}`}>
            Confirmar
          </li>
        </ul>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6 max-w-2xl mx-auto">
          <span>{error}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="card bg-base-100 shadow-xl max-w-4xl mx-auto">
        <div className="card-body">{renderStepContent()}</div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-4xl mx-auto mt-6">
        <button
          className={`btn btn-outline ${
            currentStep === 1 ? "btn-disabled" : ""
          }`}
          onClick={handlePrevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft />
          Anterior
        </button>

        <div className="flex gap-2">
          {currentStep < 4 ? (
            <button
              className="btn btn-primary"
              onClick={handleNextStep}
              disabled={isLoading}
            >
              Siguiente
              <ChevronRight />
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <Car />
              {isLoading ? "Creando..." : "Confirmar Alquiler"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
