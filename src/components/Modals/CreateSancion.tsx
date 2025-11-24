import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { getTipoSanciones, createSancion } from "../../services/sancionesService";
import { createDaño } from "../../services/dañosService";
import CreateDanoModal from "./CreateDano";

interface TipoSancion {
  id_tipo_sancion: number;
  descripcion: string;
}

interface Dano {
  idTipoDaño: string;
  gravedad: string;
  nombreTipoDaño: string;
  labelGravedad: string;
}

export default function CreateSancionModal() {
  const [formData, setFormData] = useState({
    tipoSancion: "",
    costoBase: "",
    descripcion: "",
    idAlquiler: "",
  });

  const [tipoSanciones, setTipoSanciones] = useState<TipoSancion[]>([]);
  const [daños, setDaños] = useState<Dano[]>([]);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchTipoSanciones = async () => {
      try {
        const data = await getTipoSanciones();
        setTipoSanciones(data);
      } catch (error) {
        console.error("Error fetching tipo sanciones:", error);
      }
    };
    fetchTipoSanciones();
  }, []);

  const alquileresDummy = [
    { id: "1", label: "Alquiler #1 - Toyota Corolla" },
    { id: "2", label: "Alquiler #2 - Ford Fiesta" },
    { id: "3", label: "Alquiler #3 - Chevrolet Onix" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  };

  const handleAddDano = (dano: Dano) => {
    setDaños((prev) => [...prev, dano]);
  };

  const handleRemoveDano = (index: number) => {
    setDaños((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.tipoSancion) {
      newErrors.tipoSancion = "El tipo de sanción es obligatorio";
      isValid = false;
    }

    if (!formData.costoBase || Number(formData.costoBase) <= 0) {
      newErrors.costoBase = "El costo base es obligatorio y debe ser mayor a 0";
      isValid = false;
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria";
      isValid = false;
    }

    if (!formData.idAlquiler) {
      newErrors.idAlquiler = "El alquiler es obligatorio";
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

    const selectedTipoSancion = tipoSanciones.find(
      (tipo) => String(tipo.id_tipo_sancion) === String(formData.tipoSancion)
    );
    
    const isDaños = selectedTipoSancion?.descripcion.toLowerCase().includes("daño");

    if (isDaños && daños.length === 0) {
      alert("Debe agregar al menos un daño para este tipo de sanción.");
      return;
    }

    try {
      // 1. Create Sancion
      const createdSancion = await createSancion(
        formData.tipoSancion,
        formData.costoBase,
        formData.descripcion,
        formData.idAlquiler,
        daños // Passing damages just in case backend needs them, though we process them separately below as requested
      );

      const idSancion = createdSancion.id_sancion || createdSancion.id; // Adjust based on actual backend response

      // 2. Create Daños if applicable
      if (isDaños && daños.length > 0 && idSancion) {
        for (const dano of daños) {
          await createDaño(dano.idTipoDaño, dano.gravedad, idSancion);
        }
      }

      console.log("Sanción creada exitosamente");

      const modal = document.getElementById("modal_create_sancion") as HTMLDialogElement;
      modal?.close();
      
      // Reset form
      setFormData({
        tipoSancion: "",
        costoBase: "",
        descripcion: "",
        idAlquiler: "",
      });
      setDaños([]);
      setErrors({});

    } catch (error) {
      console.error("Error creating sancion or daños:", error);
      alert("Ocurrió un error al crear la sanción.");
    }
  };

  const selectedTipoSancion = tipoSanciones.find(
    (tipo) => String(tipo.id_tipo_sancion) === String(formData.tipoSancion)
  );
  
  const isDaños = selectedTipoSancion?.descripcion.toLowerCase().includes("daño");

  return (
    <>
      <button
        className="ml-4 btn btn-secondary tooltip"
        data-tip="Crear Sanción"
        onClick={() => (document.getElementById("modal_create_sancion") as HTMLDialogElement)?.showModal()}
      >
        <Plus />
        Agregar Sanción
      </button>
      <dialog id="modal_create_sancion" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Crear Sanción</h3>

          <form className="py-4">
            {/* Tipo de Sanción */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Tipo de Sanción *</span>
              </label>
              <select
                name="tipoSancion"
                value={formData.tipoSancion}
                onChange={handleChange}
                className={`select select-bordered w-full ${errors.tipoSancion ? "select-error" : ""}`}
              >
                <option value="" disabled>Seleccione un tipo</option>
                {tipoSanciones.map((tipo) => (
                  <option key={tipo.id_tipo_sancion} value={tipo.id_tipo_sancion}>
                    {tipo.descripcion}
                  </option>
                ))}
              </select>
              {errors.tipoSancion && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.tipoSancion}</span>
                </label>
              )}
            </div>

            {/* Lista de Daños Agregados */}
            {isDaños && daños.length > 0 && (
              <div className="w-full mb-4">
                <label className="label">
                  <span className="label-text">Daños Agregados:</span>
                </label>
                <div className="flex flex-col gap-2">
                  {daños.map((dano, index) => (
                    <div key={index} className="alert alert-info py-2 flex justify-between items-center">
                      <span>{dano.nombreTipoDaño} - Gravedad: {dano.labelGravedad}</span>
                      <button
                        type="button"
                        className="btn btn-xs btn-circle btn-ghost"
                        onClick={() => handleRemoveDano(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón Agregar Daño (Condicional) */}
            {isDaños && (
              <div className="form-control w-full mb-4">
                <button
                  type="button"
                  className="btn btn-secondary w-full"
                  onClick={() => (document.getElementById("modal_create_dano") as HTMLDialogElement)?.showModal()}
                >
                  Agregar daño
                </button>
              </div>
            )}

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

            {/* Descripción */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Descripción *</span>
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describa lo ocurrido"
                className={`textarea textarea-bordered w-full ${errors.descripcion ? "textarea-error" : ""}`}
              ></textarea>
              {errors.descripcion && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.descripcion}</span>
                </label>
              )}
            </div>

            {/* Alquiler */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Alquiler *</span>
              </label>
              <select
                name="idAlquiler"
                value={formData.idAlquiler}
                onChange={handleChange}
                className={`select select-bordered w-full ${errors.idAlquiler ? "select-error" : ""}`}
              >
                <option value="" disabled>Seleccione un alquiler</option>
                {alquileresDummy.map((alquiler) => (
                  <option key={alquiler.id} value={alquiler.id}>
                    {alquiler.label}
                  </option>
                ))}
              </select>
              {errors.idAlquiler && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.idAlquiler}</span>
                </label>
              )}
            </div>
          </form>

          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-primary mr-2" onClick={handleSubmit}>
                Enviar
              </button>
              <button className="btn" onClick={() => {
                 setErrors({});
                 setFormData({
                    tipoSancion: "",
                    costoBase: "",
                    descripcion: "",
                    idAlquiler: "",
                 });
                 setDaños([]);
              }}>Cancelar</button>
            </form>
          </div>
        </div>
      </dialog>
      <CreateDanoModal onConfirm={handleAddDano} />
    </>
  );
}
