import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { getClients } from "../../services/clientService";
import { getAviableCarsForRental } from "../../services/autosService";
import { getEmployees } from "../../services/employeeService";
import { createRental } from "../../services/rentalService";
import { useLocation } from "wouter";
import { ArrowLeft, Car } from "lucide-react";
import type { Client } from "../../services/clientService.d";

interface CarOption {
  id: number;
  marca: string;
  modelo: string;
  patente: string;
  costo: number;
}

interface EmployeeOption {
  id: number;
  legajo: string;
  legajo_empleado: string;
  nombre: string;
  apellido: string;
}

export default function CreateRental() {
  const [, setLocation] = useLocation();
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
      if (!formData.fechaInicio || !formData.fechaFin) {
        setCar([]);
        return;
      }

      const start = new Date(formData.fechaInicio);
      const end = new Date(formData.fechaFin);

      if (start >= end) {
        setCar([]);
        return;
      }

      setIsFetchingCars(true);
      try {
        const carsData = await getAviableCarsForRental(formData.fechaInicio, formData.fechaFin);
        setCar(carsData);
      } catch (error) {
        console.error("Error fetching available cars:", error);
        setCar([]);
      } finally {
        setIsFetchingCars(false);
      }
    };

    fetchAvailableCars();
  }, [formData.fechaInicio, formData.fechaFin]);

  useEffect(() => {
    const calculateCost = () => {
      if (!formData.fechaInicio || !formData.fechaFin || !formData.auto) {
        setFormData(prev => ({ ...prev, costo: 0 }));
        return;
      }

      const start = new Date(formData.fechaInicio);
      const end = new Date(formData.fechaFin);
      
      if (start >= end) {
        setFormData(prev => ({ ...prev, costo: 0 }));
        return;
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      const selectedCar = car.find(c => c.patente === formData.auto);
      if (selectedCar) {
        setFormData(prev => ({ ...prev, costo: diffDays * selectedCar.costo }));
      }
    };

    calculateCost();
  }, [formData.fechaInicio, formData.fechaFin, formData.auto, car]);

  const handleVolver = () => {
    setLocation("/car-rentals");
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const fechasValidas = await handleDateValidation();
    if (!fechasValidas) {
      return;
    }

    try {
      setIsLoading(true);
      
      // No need to check availability again as the list is already filtered by date
      // but keeping it safe won't hurt if the backend supports it, 
      // though the user asked to use getAviableCarsForRental to populate the list.
      // We assume the selected car from the list is available.

      await createRental(formData);
      setLocation("/car-rentals");
    } catch (error) {
      console.error("Error creating rental:", error);
      setError("Error al crear el alquiler");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex mt-2 gap-2">
        <button
          className="btn btn-circle btn-neutral tooltip"
          data-tip="Volver"
          onClick={handleVolver}
        >
          <ArrowLeft />
        </button>
        <h1 className="font-semibold text-3xl flex justify-center">
          Registra un alquiler
        </h1>
      </div>
      <div className="gap-2 ml-2 mt-4 flex flex-col">
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-4">
          <div className="fl">
            <label htmlFor=""> Ingrese fecha desde:</label>
            <input
              type="date"
              className="input input-bordered w-full max-w-xs ml-2"
              value={formData.fechaInicio}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, fechaInicio: e.target.value, auto: "" })
              }
            />
          </div>
          <div className="">
            <label htmlFor=""> Ingrese fecha hasta:</label>
            <input
              type="date"
              className="input input-bordered w-full max-w-xs ml-2"
              value={formData.fechaFin}
              min={
                formData.fechaInicio || new Date().toISOString().split("T")[0]
              }
              onChange={(e) =>
                setFormData({ ...formData, fechaFin: e.target.value, auto: "" })
              }
            />
          </div>
        </div>
        <label htmlFor="">
          Selecciona el cliente
          <select
            className="select select-bordered w-full max-w-xs ml-2"
            name="cliente"
            value={formData.cliente}
            onChange={handleFormChange}
            disabled={isLoading}
          >
            <option value="">Seleccione un cliente</option>
            {client?.map((clientItem) => (
                <option key={clientItem.dni_cliente} value={clientItem.dni_cliente}>
                  {clientItem.nombre} {clientItem.apellido}
                </option>
              ))}
            {client?.length === 0 && (
              <option disabled>No hay clientes registrados</option>
            )}
          </select>
        </label>
        <label htmlFor="">
          Costo del alquiler (Calculado) $
          <input
            type="text"
            className="input input-bordered w-full max-w-xs ml-2 bg-gray-100"
            value={formData.costo > 0 ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(formData.costo) : "$ 0"}
            disabled
            readOnly
          />
        </label>

        <label htmlFor="">
          Auto
          <select
            className="select select-bordered w-full max-w-xs ml-2"
            name="auto"
            value={formData.auto}
            onChange={handleFormChange}
            disabled={isLoading || isFetchingCars || car.length === 0}
          >
            <option value="">
              {isFetchingCars 
                ? "Buscando autos disponibles..." 
                : (!formData.fechaInicio || !formData.fechaFin)
                  ? "Seleccione fechas primero"
                  : "Seleccione un auto"}
            </option>
            {car?.map((carItem) => (
                <option key={carItem.patente} value={carItem.patente}>
                  {carItem.marca} {carItem.modelo} {carItem.patente} - {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(carItem.costo)}/día
                </option>
              ))}
            {!isFetchingCars && car?.length === 0 && formData.fechaInicio && formData.fechaFin && (
              <option disabled>No hay autos disponibles para estas fechas</option>
            )}
          </select>
        </label>

        <label htmlFor="">
          Selecciona empleado:
          <select
            className="select select-bordered w-full max-w-xs ml-2"
            name="empleado"
            value={formData.empleado}
            onChange={handleFormChange}
            disabled={isLoading}
          >
            <option value="">Seleccione un empleado</option>
            {employee?.map((employeeItem) => (
                <option key={employeeItem.legajo_empleado} value={employeeItem.legajo_empleado}>
                  {employeeItem.legajo_empleado} {employeeItem.nombre} {employeeItem.apellido}
                </option>
              ))}
            {employee?.length === 0 && (
              <option disabled>No hay empleados registrados</option>
            )}
          </select>
        </label>
      </div>

      <div className="flex w-full justify-end mt-4 mr-6">
        <button
          className="btn btn-success"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          <Car />
          {isLoading ? "Validando..." : "Crear Alquiler"}
        </button>
      </div>
    </div>
  );
}
