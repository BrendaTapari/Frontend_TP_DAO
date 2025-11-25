import { useState } from "react";
import { updateRental, carAvailable } from "../../services/rentalService";
import { Calendar, DollarSign, AlertCircle } from "lucide-react";

interface Rental {
    id: number;
    fechaFin: string;
    vehiculo: {
        patente: string;
    }
}

interface ExtendRentalProps {
  rental: Rental;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ExtendRental({ rental, isOpen, onClose, onSuccess }: ExtendRentalProps) {
  const [newEndDate, setNewEndDate] = useState("");
  const [extraCost, setExtraCost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newEndDate) {
      setError("Por favor seleccione una nueva fecha de finalización.");
      return;
    }

    const currentEndDate = new Date(rental.fechaFin);
    currentEndDate.setHours(0, 0, 0, 0);

    const [year, month, day] = newEndDate.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);

    if (selectedDate <= currentEndDate) {
      setError("La nueva fecha debe ser posterior a la fecha de fin actual.");
      return;
    }

    if (!extraCost || parseFloat(extraCost) < 0) {
        setError("Por favor ingrese un costo extra válido.");
        return;
    }

    setIsLoading(true);
    try {
      const availability = await carAvailable(rental.vehiculo.patente, rental.fechaFin, newEndDate);
      if (!availability.available) {
        setError("El vehículo no está disponible para la extensión solicitada.");
        setIsLoading(false);
        return;
      }

      await updateRental(rental.id, newEndDate, parseFloat(extraCost));
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error extending rental:", err);
      setError("Ocurrió un error al extender el alquiler. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Calendar className="text-primary" />
          Extender Alquiler
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="alert alert-error text-sm py-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Fecha de Fin Actual</span>
              </label>
              <input 
                type="text" 
                value={new Date(rental.fechaFin).toLocaleDateString("es-AR")} 
                className="input input-bordered w-full bg-base-200" 
                disabled 
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Nueva Fecha de Fin</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={new Date(rental.fechaFin).toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Costo Extra</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-500" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  className="input input-bordered w-full pl-10"
                  placeholder="0.00"
                  value={extraCost}
                  onChange={(e) => setExtraCost(e.target.value)}
                  required
                />
              </div>
              <label className="label">
                <span className="label-text-alt text-gray-500">Costo adicional por la extensión</span>
              </label>
            </div>
          </div>

          <div className="modal-action mt-6">
            <button 
              type="button" 
              className="btn btn-ghost" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
              Cambiar
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
