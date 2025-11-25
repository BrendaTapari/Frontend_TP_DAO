import {
  User,
  Car,
  Shield,
  AlertTriangle,
  Briefcase,
  FileText,
  Clock,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import ExtendRental from "./ExtendRental";
import PaymentModal from "./PaymentModal";

interface Auto {
    patente: string;
    marca: string;
    modelo: string;
    anio: number;
    color: string;
    costo: number;
    periodicidadMantenimineto: number;
    estado: {nombre: string};
    seguro: Seguro;
}

interface Cliente {
    nombre: string,
    apellido: string,
    direccion: string,
    fechaNacimiento: string,
    dni_cliente: number,
    telefono: string,
    email: string,
}

interface Empleado {
    nombre: string,
    apellido: string,
    direccion: string,
    fechaNacimiento: string,
    DNI: number,
    telefono: string,
    email: string,
    legajo_empleado: string,
    puesto: string,
    salario: number,
    fechaInicioActividad: string,
}

interface Sancion {
    id_sancion: number;
    costo_total: number;
    tipo_sancion: {descripcion: string};
    fecha: string
    estado: {nombre: string}
}

interface Seguro {
  poliza_seguro: number,
  fechaVencimiento: string,
  tipoPoliza: {descripcion: string},
  compañia: string

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
}

interface SpecificRentalProps {
  rental: Rental | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function SpecificRental({ rental, isOpen, onClose, onUpdate }: SpecificRentalProps) {
  const [isExtendRentalOpen, setIsExtendRentalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (!isOpen || !rental) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-AR");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const calculateTotalCost = () => {
    let total = rental.precio;
    if (rental.sanciones && rental.sanciones.length > 0) {
      total += rental.sanciones.reduce((acc, sancion) => acc + sancion.costo_total, 0);
    }
    return total;
  };

  return (
    <>
    <dialog className="modal modal-open">
      <div className="modal-box max-w-5xl">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h3 className="font-bold text-2xl flex items-center gap-2">
            <FileText className="text-primary" />
            Detalles del Alquiler #{rental.id}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsExtendRentalOpen(true)}
            >
              <Clock size={16} />
              Extender Alquiler
            </button>
            <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Cliente y Empleado Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Cliente Section */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <h4 className="card-title text-lg mb-4 flex items-center gap-2">
                  <User className="text-secondary" />
                  Cliente
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                   <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Nombre Completo</p>
                      <p className="font-semibold text-lg">{rental.cliente.nombre} {rental.cliente.apellido}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">DNI</p>
                      <p className="font-medium">{rental.cliente.dni_cliente}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Fecha Nacimiento</p>
                      <p className="font-medium">{formatDate(rental.cliente.fechaNacimiento)}</p>
                   </div>
                   <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="font-medium">{rental.cliente.email}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Teléfono</p>
                      <p className="font-medium">{rental.cliente.telefono}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Dirección</p>
                      <p className="font-medium">{rental.cliente.direccion}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Empleado Section */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <h4 className="card-title text-lg mb-4 flex items-center gap-2">
                  <Briefcase className="text-accent" />
                  Empleado
                </h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                   <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Legajo</p>
                      <p className="font-bold text-lg text-primary">{rental.empleado.legajo_empleado}</p>
                   </div>
                   <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Nombre Completo</p>
                      <p className="font-semibold">{rental.empleado.nombre} {rental.empleado.apellido}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">DNI</p>
                      <p className="font-medium">{rental.empleado.DNI}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Fecha Nacimiento</p>
                      <p className="font-medium">{formatDate(rental.empleado.fechaNacimiento)}</p>
                   </div>
                   <div className="col-span-2">
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="font-medium">{rental.empleado.email}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Teléfono</p>
                      <p className="font-medium">{rental.empleado.telefono}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Dirección</p>
                      <p className="font-medium">{rental.empleado.direccion}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehiculo y Seguro Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Vehiculo Section */}
             <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <h4 className="card-title text-lg mb-4 flex items-center gap-2">
                  <Car className="text-info" />
                  Vehículo
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                      <p className="text-gray-500 text-xs">Patente</p>
                      <p className="font-bold text-lg">{rental.vehiculo.patente}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Estado</p>
                      <div className="badge badge-outline">{rental.vehiculo.estado.nombre}</div>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Marca</p>
                      <p className="font-medium">{rental.vehiculo.marca}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Modelo</p>
                      <p className="font-medium">{rental.vehiculo.modelo}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Año</p>
                      <p className="font-medium">{rental.vehiculo.anio}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Color</p>
                      <p className="font-medium">{rental.vehiculo.color}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Costo Diario</p>
                      <p className="font-medium text-success">{formatCurrency(rental.vehiculo.costo)}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Mantenimiento (km)</p>
                      <p className="font-medium">{rental.vehiculo.periodicidadMantenimineto} km</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Seguro Section */}
            <div className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-5">
                <h4 className="card-title text-lg mb-4 flex items-center gap-2">
                  <Shield className="text-warning" />
                  Seguro
                </h4>
                <div className="grid grid-cols-1 gap-4 text-sm">
                   <div>
                      <p className="text-gray-500 text-xs">Compañía</p>
                      <p className="font-bold text-lg">{rental.vehiculo.seguro.compañia}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Póliza</p>
                      <p className="font-medium">{rental.vehiculo.seguro.poliza_seguro}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Tipo de Póliza</p>
                      <p className="font-medium">{rental.vehiculo.seguro.tipoPoliza.descripcion}</p>
                   </div>
                   <div>
                      <p className="text-gray-500 text-xs">Vencimiento</p>
                      <p className="font-medium">{formatDate(rental.vehiculo.seguro.fechaVencimiento)}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sanciones Section */}
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <h4 className="card-title text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="text-error" />
                Sanciones
              </h4>
              
              {rental.sanciones && rental.sanciones.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr className="bg-base-200">
                        <th>ID</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Costo Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rental.sanciones.map((sancion) => (
                        <tr key={sancion.id_sancion}>
                          <td className="font-mono text-xs">{sancion.id_sancion}</td>
                          <td>{sancion.tipo_sancion.descripcion}</td>
                          <td>{formatDate(sancion.fecha)}</td>
                          <td className="font-medium text-error">{formatCurrency(sancion.costo_total)}</td>
                          <td>
                            <div className="badge badge-sm badge-outline">{sancion.estado.nombre}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-success bg-success/10 border-success/20">
                  <Shield className="w-5 h-5" />
                  <span>Este alquiler no registra sanciones.</span>
                </div>
              )}
            </div>
          </div>

          {/* Rental Summary Section */}
          <div className="card bg-base-200 border border-base-300 shadow-sm">
            <div className="card-body p-5">
              <h4 className="card-title text-lg mb-4 flex items-center gap-2">
                <FileText className="text-primary" />
                Resumen del Alquiler
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                    <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Fecha Inicio</p>
                    <p className="font-bold text-lg">{formatDate(rental.fechaInicio)}</p>
                 </div>
                 <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                    <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Fecha Fin</p>
                    <p className="font-bold text-lg">{formatDate(rental.fechaFin)}</p>
                 </div>
                 <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                    <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Costo Total (con sanciones)</p>
                    <p className="font-bold text-2xl text-success">{formatCurrency(calculateTotalCost())}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button 
              className="btn btn-success text-white"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <DollarSign size={20} />
              Cobrar Alquiler
            </button>
          </div>

        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
    
    <ExtendRental 
      rental={rental!}
      isOpen={isExtendRentalOpen}
      onClose={() => setIsExtendRentalOpen(false)}
      onSuccess={() => {
        if (onUpdate) onUpdate();
        onClose();
      }}
    />

    <PaymentModal
      rentalId={rental.id}
      isOpen={isPaymentModalOpen}
      onClose={() => setIsPaymentModalOpen(false)}
      onSuccess={() => {
        if (onUpdate) onUpdate();
        onClose();
      }}
    />
    </>
  );
}
