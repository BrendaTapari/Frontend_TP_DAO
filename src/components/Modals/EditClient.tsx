import { useState, useEffect } from "react";
import { updateClient } from "../../services/clientService";
import { Edit } from "lucide-react";

interface EditClientProps {
  client?: {
    nombre: string;
    apellido: string;
    dni: number;
    email: string;
    telefono: number;
    direccion: string;
    fechaNacimiento: string;
  };
  onSuccess?: () => void;
}

interface FormErrors {
  nombre?: string;
  apellido?: string;
  DNI?: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  direccion?: string;
}

export default function EditClient({ client, onSuccess }: EditClientProps) {
  const [formData, setFormData] = useState({
    dni: client?.dni as number,
    email: client?.email || "",
    telefono: client?.telefono || 0,
    direccion: client?.direccion || ""
  });

  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (client) {
      setFormData({
        dni: client.dni as number,
        email: client.email || "",
        telefono: client.telefono || 0,
        direccion: client.direccion || "",
      });
    }
  }, [client]);

  const clearError = (fieldName: keyof FormErrors) => {
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Limpiar error del campo cuando el usuario empiece a escribir
    clearError(name as keyof FormErrors);

    if (name === "telefono") {
      const numbersOnly = value.replace(/\D/g, "");
      const limitedValue = numbersOnly.slice(0, 14);
      setFormData((prevData) => ({ ...prevData, [name]: limitedValue as unknown as number }));
    } 
    else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client) {
      return;
    }else{
      setIsLoading(true);
      setErrors({});
    
      try {
          await updateClient(client?.dni as number, formData);

          client.email = formData.email;
          client.telefono = formData.telefono;
          client.direccion = formData.direccion;

          const modal = document.getElementById(
            "modal_editar_cliente"
          ) as HTMLDialogElement;
          if (modal) {
            modal.close();
          }
    
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          console.error("Error updating client:", error);
          setErrors({
            email: "Error al actualizar el cliente. Por favor, intente nuevamente."
          });
        } finally {
          setIsLoading(false);
        }
    }


  };

  const openModal = () => {
    const modal = document.getElementById(
      "modal_editar_cliente"
    ) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={openModal}
        disabled={isLoading}
      >
      <Edit size={16} />
        Editar Cliente
      </button>
      <dialog id="modal_editar_cliente" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Editar Cliente</h3>

          <form onSubmit={handleSubmit} className="py-4">
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Nombre</span>
              </label>
              <p className="py-2 px-4 border rounded-md bg-gray-100 text-gray-700">
                {client?.nombre}
              </p>
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Apellido</span>
              </label>
              <p className="py-2 px-4 border rounded-md bg-gray-100 text-gray-700">
                {client?.apellido}
              </p>
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">DNI</span>
              </label>
              <p className="py-2 px-4 border rounded-md bg-gray-100 text-gray-700">
                {client?.dni_cliente}
              </p>
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                required
              />
              {errors.email && <span className="label-text-alt text-red-500">{errors.email}</span>}
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Teléfono</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ingrese el teléfono"
                className={`input input-bordered w-full ${errors.telefono ? 'input-error' : ''}`}
                required
              />
              {errors.telefono && <span className="label-text-alt text-red-500">{errors.telefono}</span>}
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Dirección</span>
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ingrese la dirección"
                className={`input input-bordered w-full ${errors.direccion ? 'input-error' : ''}`}
                required
              />
              {errors.direccion && <span className="label-text-alt text-red-500">{errors.direccion}</span>}
            </div>

            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Fecha de Nacimiento</span>
              </label>
              <p className="py-2 px-4 border rounded-md bg-gray-100 text-gray-700">
                {client?.fechaNacimiento}
              </p>
            </div>

            <div className="modal-action">
              <button
                type="submit"
                className="btn btn-primary mr-2"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  const modal = document.getElementById(
                    "modal_editar_cliente"
                  ) as HTMLDialogElement;
                  if (modal) modal.close();
                }}
              >
                Cerrar
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
