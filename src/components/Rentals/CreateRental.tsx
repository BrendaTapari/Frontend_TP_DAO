import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { getClients } from "../../services/clientService";
import { getAviableCarsForRental } from "../../services/autosService";
import { getEmployees } from "../../services/employeeService";
import { createRental } from "../../services/rentalService";
import { useLocation } from "wouter";
import { ArrowLeft, Car, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { es } from "date-fns/locale";
import type { Client } from "../../services/clientService.d";
import CoveredCarImage from "../../images/CoveredCar.jpg";

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
  const [isFetchingCars, setIsFetchingCars] = useState(false);
  const [error, setError] = useState("");

  const dateCalculations = useMemo(() => {
    if (!formData.fechaInicio || !formData.fechaFin) {
      return { isValid: false, days: 0 };
    }

    const start = new Date(formData.fechaInicio);
    const end = new Date(formData.fechaFin);

    if (start >= end) {
      return { isValid: false, days: 0 };
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return { isValid: true, days };
  }, [formData.fechaInicio, formData.fechaFin]);

  useEffect(() => {
    const fetchClientsAndEmployees = async () => {
      try {
        const clientData = await getClients();
        setClient(clientData);

        const employeesData = await getEmployees();
        setEmployee(employeesData);
      } catch (error) {
        console.error("Error fetching:", error);
      }
    };

    fetchClientsAndEmployees();
  }, []);

  useEffect(() => {
    const fetchAvailableCars = async () => {
      if (!dateCalculations.isValid) {
        setCar([]);
        return;
      }

      setIsFetchingCars(true);
      try {
        const carsData = await getAviableCarsForRental(
          formData.fechaInicio,
          formData.fechaFin,
        );
        setCar(carsData);
      } catch (error) {
        console.error("Error fetching available cars:", error);
        setCar([]);
      } finally {
        setIsFetchingCars(false);
      }
    };

    fetchAvailableCars();
  }, [formData.fechaInicio, formData.fechaFin, dateCalculations.isValid]);

  const getImageUrl = (imagen?: string) => {
    if (imagen) {
      return `data:image/jpeg;base64,${imagen}`;
    }

    return CoveredCarImage;
  };

  useEffect(() => {
    const calculateCost = () => {
      if (!dateCalculations.isValid || !formData.auto) {
        setFormData((prev) => ({ ...prev, costo: 0 }));
        return;
      }

      const selectedCar = car.find((c) => c.patente === formData.auto);
      if (selectedCar) {
        setFormData((prev) => ({
          ...prev,
          costo: dateCalculations.days * selectedCar.costo,
        }));
      }
    };

    calculateCost();
  }, [dateCalculations.isValid, dateCalculations.days, formData.auto]);

  useEffect(() => {
    if (formData.auto && dateCalculations.isValid && car.length > 0) {
      const selectedCar = car.find((c) => c.patente === formData.auto);
      if (selectedCar) {
        setFormData((prev) => ({
          ...prev,
          costo: dateCalculations.days * selectedCar.costo,
        }));
      }
    }
  }, [car, formData.auto, dateCalculations.isValid, dateCalculations.days]);

  const handleVolver = useCallback(() => {
    setLocation("/");
  }, [setLocation]);

  const handleFormChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    [],
  );

  const handleCarSelection = useCallback((patente: string) => {
    setFormData((prev) => ({ ...prev, auto: patente }));
  }, []);

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

  const handlePrevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  }, [currentStep]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const fechasValidas = await handleDateValidation();
    if (!fechasValidas) {
      return;
    }

    try {
      setIsLoading(true);

      const selectedClient = client.find(
        (c) => `${c.nombre} ${c.apellido}` === formData.cliente,
      );
      const selectedEmployee = employee.find(
        (e) => `${e.nombre} ${e.apellido}` === formData.empleado,
      );

      const rentalData = {
        ...formData,
        cliente:
          selectedClient?.dni_cliente || selectedClient?.id || formData.cliente,
        empleado:
          selectedEmployee?.legajo_empleado ||
          selectedEmployee?.id ||
          formData.empleado,
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
            <h2 className="text-3xl font-semibold text-center mb-6">
              Selecciona las fechas
            </h2>
            <div className="flex justify-center w-full">
              <div className="form-control w-full max-w-xl">
                <label className="label justify-center pb-4">
                  <span className="label-text font-medium text-xl text-white">Seleccione el período de alquiler</span>
                </label>
                <div className="relative inline-block w-full text-center">
                  <button 
                    type="button"
                    popoverTarget="rdp-popover-range" 
                    className="input input-bordered w-full h-16 text-center text-gray-200 flex items-center justify-center bg-base-200/50 hover:bg-base-200 transition-colors text-lg tracking-wide border-white/20" 
                    style={{ anchorName: "--rdp-range" } as React.CSSProperties}
                  >
                    {formData.fechaInicio ? (
                      formData.fechaFin ? (
                        `${new Date(formData.fechaInicio + "T12:00:00").toLocaleDateString()}   —   ${new Date(formData.fechaFin + "T12:00:00").toLocaleDateString()}`
                      ) : (
                        `${new Date(formData.fechaInicio + "T12:00:00").toLocaleDateString()}   —   Seleccione fin`
                      )
                    ) : (
                      "Fechas de check-in y check-out"
                    )}
                  </button>
                  <div 
                    popover="auto" 
                    id="rdp-popover-range" 
                    className="dropdown bg-base-200 border border-white/10 rounded-2xl p-2  m-2 text-gray-200 shadow-xl" 
                    style={{ positionAnchor: "--rdp-range" } as React.CSSProperties}
                  >
                    <DayPicker 
                      locale={es}
                      className="react-day-picker" 
                      mode="range" 
                      numberOfMonths={2}  
                      selected={{
                        from: formData.fechaInicio ? new Date(formData.fechaInicio + "T12:00:00") : undefined,
                        to: formData.fechaFin ? new Date(formData.fechaFin + "T12:00:00") : undefined,
                      }} 
                      disabled={{ before: new Date() }}
                      onSelect={(range) => {
                        let inicio = "";
                        let fin = "";
                        
                        if (range?.from) {
                            inicio = `${range.from.getFullYear()}-${String(range.from.getMonth() + 1).padStart(2, "0")}-${String(range.from.getDate()).padStart(2, "0")}`;
                        }
                        if (range?.to) {
                            fin = `${range.to.getFullYear()}-${String(range.to.getMonth() + 1).padStart(2, "0")}-${String(range.to.getDate()).padStart(2, "0")}`;
                        }
                        
                        setFormData({ ...formData, fechaInicio: inicio, fechaFin: fin, auto: "" });
                      }} 
                    />
                    <div className="flex gap-2 w-full px-4 pb-4 mt-2">
                      <button
                        className="btn btn-outline btn-error btn-sm flex-1 font-light"
                        onClick={() => setFormData({ ...formData, fechaInicio: "", fechaFin: "", auto: "" })}
                        disabled={!formData.fechaInicio && !formData.fechaFin}
                      >
                        Limpiar
                      </button>
                      <button
                        className="btn btn-primary btn-sm flex-1 font-medium text-black"
                        onClick={() => document.getElementById("rdp-popover-range")?.hidePopover?.()}
                      >
                        Aceptar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {formData.fechaInicio && formData.fechaFin && (
              <div className="text-center">
                <div className="stat bg-base-200 text-gray-100 rounded-lg inline-block">
                  <div className="stat-title">Duración del alquiler</div>
                  <div className="stat-value text-primary">
                    {dateCalculations.days} días
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

            {isFetchingCars ? (
              <div className="text-center">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="text-lg text-gray-200 mt-2">
                  Buscando autos disponibles...
                </p>
              </div>
            ) : car?.length === 0 ? (
              <div className="text-center">
                <p className="text-lg text-gray-200">
                  No hay autos disponibles para estas fechas
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {car?.map((carItem) => (
                  <div
                    key={carItem.patente}
                    className={`card bg-base-100 text-gray-100 w-full shadow-sm cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      formData.auto === carItem.patente
                        ? "ring-2 ring-primary shadow-lg"
                        : "hover:scale-105"
                    }`}
                    onClick={() => handleCarSelection(carItem.patente)}
                  >
                    <figure className="h-48 bg-gray-100 overflow-hidden">
                      {carItem.imagen ? (
                        <img
                          src={getImageUrl(carItem.imagen)}
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
                <div className="stat bg-base-200 text-gray-100 rounded-lg inline-block">
                  <div className="stat-title">Costo total estimado</div>
                  <div className="stat-value text-success">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(formData.costo)}
                  </div>
                  <div className="stat-desc">
                    {dateCalculations.days} días de alquiler
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
        const selectedClient = client.find(
          (c) => `${c.nombre} ${c.apellido}` === formData.cliente,
        );
        const selectedEmployee = employee.find(
          (e) => `${e.nombre} ${e.apellido}` === formData.empleado,
        );

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              Confirma los detalles
            </h2>

            <div className="card bg-base-200 text-gray-100 shadow-xl max-w-2xl mx-auto">
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
    <div className="min-h-screen bg-base-100 text-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 mt-16">
        <button
          className="btn btn-primary btn-outline btn-circle tooltip"
          data-tip="Volver"
          onClick={() => handleVolver()}
        >
          <ChevronLeft/>
        </button>
        <h1 className="font-semibold text-3xl text-white">
          Registro de alquiler
        </h1>
      </div>

      {/* Steps Progress */}
      <div className="flex justify-center mb-8">
        <ul className="steps steps-vertical lg:steps-horizontal bg-base-200 rounded-box p-4 ">
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
      <div className="card bg-base-100 text-gray-100 shadow-xl max-w-4xl mx-auto">
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
