import { useState, useEffect } from "react";
import { getTiposDaños } from "../../services/dañosService";

interface TipoDaño {
  id_tipo_daño: number;
  nombre: string;
  costoBase: number;
}

interface CreateDanoModalProps {
  onConfirm: (dano: { idTipoDaño: string; gravedad: string; nombreTipoDaño: string; labelGravedad: string }) => void;
}

export default function CreateDanoModal({ onConfirm }: CreateDanoModalProps) {
  const [formData, setFormData] = useState({
    idTipoDaño: "",
    gravedad: "",
  });

  const [tiposDaños, setTiposDaños] = useState<TipoDaño[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const gravedadOptions = [
    { id: "1", label: "Muy leve" },
    { id: "2", label: "Leve" },
    { id: "3", label: "Medio" },
    { id: "4", label: "Grave" },
    { id: "5", label: "Muy grave" },
  ];

  useEffect(() => {
    const fetchTiposDaños = async () => {
      try {
        const data = await getTiposDaños();
        setTiposDaños(data);
      } catch (error) {
        console.error("Error fetching tipos daños:", error);
      }
    };
    fetchTiposDaños();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.idTipoDaño) {
      newErrors.idTipoDaño = "El tipo de daño es obligatorio";
      isValid = false;
    }

    if (!formData.gravedad) {
      newErrors.gravedad = "La gravedad es obligatoria";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedType = tiposDaños.find(t => String(t.id_tipo_daño) === formData.idTipoDaño);
    const selectedGravedad = gravedadOptions.find(g => g.id === formData.gravedad);

    if (selectedType && selectedGravedad) {
      onConfirm({
        idTipoDaño: formData.idTipoDaño,
        gravedad: formData.gravedad,
        nombreTipoDaño: selectedType.nombre,
        labelGravedad: selectedGravedad.label
      });
    }

    const modal = document.getElementById("modal_create_dano") as HTMLDialogElement;
    modal?.close();

    // Reset form
    setFormData({
      idTipoDaño: "",
      gravedad: "",
    });
    setErrors({});
  };

  return (
    <dialog id="modal_create_dano" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Agregar Daño</h3>

        <form className="py-4">
          {/* Tipo de Daño */}
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Tipo de Daño *</span>
            </label>
            <select
              name="idTipoDaño"
              value={formData.idTipoDaño}
              onChange={handleChange}
              className={`select select-bordered w-full ${errors.idTipoDaño ? "select-error" : ""}`}
            >
              <option value="" disabled>Seleccione un tipo de daño</option>
              {tiposDaños.map((tipo) => (
                <option key={tipo.id_tipo_daño} value={tipo.id_tipo_daño}>
                  {tipo.nombre} (CB: {tipo.costoBase})
                </option>
              ))}
            </select>
            {errors.idTipoDaño && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.idTipoDaño}</span>
              </label>
            )}
          </div>

          {/* Gravedad */}
          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">Gravedad *</span>
            </label>
            <select
              name="gravedad"
              value={formData.gravedad}
              onChange={handleChange}
              className={`select select-bordered w-full ${errors.gravedad ? "select-error" : ""}`}
            >
              <option value="" disabled>Seleccione la gravedad</option>
              {gravedadOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.gravedad && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.gravedad}</span>
              </label>
            )}
          </div>
        </form>

        <div className="modal-action">
          <form method="dialog">
            <button className="btn btn-primary mr-2" onClick={handleSubmit}>
              Enviar
            </button>
            <button
              className="btn"
              onClick={() => {
                setErrors({});
                setFormData({
                  idTipoDaño: "",
                  gravedad: "",
                });
              }}
            >
              Cancelar
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}
