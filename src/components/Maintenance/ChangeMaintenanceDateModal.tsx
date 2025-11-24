import { X } from "lucide-react";
import { useState } from "react";
import { updateOrdenMantenimiento } from "../../services/maintenanceService";

interface ChangeMaintenanceDateModalProps {
  ordenId: number;
  currentEndDate: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeMaintenanceDateModal({
  ordenId,
  currentEndDate,
  onClose,
  onSuccess,
}: Readonly<ChangeMaintenanceDateModalProps>) {
  const [fechaFin, setFechaFin] = useState(currentEndDate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const today = new Date().toISOString().split("T")[0];
    if (fechaFin < today) {
      setError("La fecha debe ser mayor o igual que el día de hoy");
      return;
    }

    setLoading(true);

    try {
      await updateOrdenMantenimiento(ordenId, fechaFin);
      onSuccess();
    } catch (err) {
      console.error("Error updating orden date:", err);
      setError("Error al actualizar la fecha de fin de la orden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Cambiar fecha de fin de mantenimiento</h3>
          <button
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
            type="button"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nueva fecha de fin *</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cerrar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
