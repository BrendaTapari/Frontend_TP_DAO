import { useState } from "react";
import { payRental } from "../../services/rentalService";
import { CreditCard, Banknote, Wallet, CheckCircle } from "lucide-react";

interface PaymentModalProps {
  rentalId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PaymentModal({ rentalId, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCharge = async () => {
    if (!selectedMethod) return;

    setIsLoading(true);
    setError("");

    try {
      await payRental(rentalId);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Error al procesar el cobro. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethods = [
    { id: "cash", name: "Efectivo", icon: Banknote },
    { id: "debit", name: "Tarjeta de Débito", icon: Wallet },
    { id: "credit", name: "Tarjeta de Crédito", icon: CreditCard },
  ];

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-6">Cobrar Alquiler</h3>

        {error && (
          <div className="alert alert-error mb-4 text-sm">
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <p className="text-sm font-medium text-gray-500 mb-2">Seleccione medio de pago:</p>
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              
              return (
                <button
                  key={method.id}
                  className={`btn btn-lg justify-start gap-4 no-animation ${
                    isSelected 
                      ? "btn-primary border-primary" 
                      : "btn-outline border-base-300 hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <Icon size={24} />
                  <span className="flex-1 text-left">{method.name}</span>
                  {isSelected && <CheckCircle size={20} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-action">
          <button 
            className="btn btn-ghost" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-success text-white px-8"
            onClick={handleCharge}
            disabled={!selectedMethod || isLoading}
          >
            {isLoading ? <span className="loading loading-spinner loading-xs"></span> : null}
            Cobrar
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
