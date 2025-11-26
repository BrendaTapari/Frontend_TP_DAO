import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { createTipoDaño, updateTipoDaño } from "../../services/dañosService";

interface TipoDanoModalProps {
  onSuccess: () => void;
  editingTipo?: {
    id_tipo_daño: number;
    nombre: string;
    costoBase: number;
  } | null;
  onClose: () => void;
}

export default function CreateTipoDanoModal({ onSuccess, editingTipo, onClose }: TipoDanoModalProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    costoBase: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingTipo) {
      setFormData({
        nombre: editingTipo.nombre,
        costoBase: editingTipo.costoBase.toString(),
      });
    } else {
      setFormData({ nombre: "", costoBase: "" });
    }
  }, [editingTipo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
      isValid = false;
    }

    if (!formData.costoBase || Number(formData.costoBase) <= 0) {
      newErrors.costoBase = "El costo base es obligatorio y debe ser mayor a 0";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingTipo) {
        await updateTipoDaño(editingTipo.id_tipo_daño, formData.nombre, parseFloat(formData.costoBase));
      } else {
        await createTipoDaño(formData.nombre, parseFloat(formData.costoBase));
      }
      
      const modal = document.getElementById("modal_create_tipo_dano") as HTMLDialogElement;
      modal?.close();
      
      setFormData({ nombre: "", costoBase: "" });
      setErrors({});
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Error saving tipo de daño:", error);
    }
  };

  return (
    <>
      <button
        className="btn btn-secondary"
        onClick={() => {
          const modal = document.getElementById("modal_create_tipo_dano") as HTMLDialogElement;
          modal?.showModal();
        }}
      >
        <Plus />
        Crear Tipo de Daño
      </button>
      <dialog id="modal_create_tipo_dano" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {editingTipo ? "Editar" : "Crear"} Tipo de Daño
          </h3>

          <form className="py-4">
            {/* Nombre */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Nombre *</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Rayón, Abolladura, etc."
                className={`input input-bordered w-full ${errors.nombre ? "input-error" : ""}`}
              />
              {errors.nombre && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.nombre}</span>
                </label>
              )}
            </div>

            {/* Costo Base */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Costo Base *</span>
              </label>
              <input
                type="number"
                name="costoBase"
                value={formData.costoBase}
                onChange={handleChange}
                placeholder="Ingrese el costo base"
                className={`input input-bordered w-full ${errors.costoBase ? "input-error" : ""}`}
                min="0.01"
                step="0.01"
              />
              {errors.costoBase && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.costoBase}</span>
                </label>
              )}
            </div>
          </form>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-primary mr-2" onClick={handleSubmit}>
                {editingTipo ? "Actualizar" : "Crear"}
              </button>
              <button
                className="btn"
                onClick={() => {
                  setErrors({});
                  setFormData({ nombre: "", costoBase: "" });
                  onClose();
                }}
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
