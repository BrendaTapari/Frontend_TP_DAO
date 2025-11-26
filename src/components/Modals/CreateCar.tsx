import { Plus, Save, Upload, X } from "lucide-react";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createAuto } from "../../services/autosService";
import { getInsurances } from "../../services/insuranceService";

interface CreateCarProps {
  onSuccess?: () => void;
}

export default function CreateCar({ onSuccess }: CreateCarProps) {
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    anio: "",
    color: "",
    costo: "",
    patente: "",
    periodicidadMantenimineto: "",
    id_seguro: "",
  });

  const [insurances, setInsurances] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragError, setDragError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setDragError("");

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        setDragError("El archivo es demasiado grande. Máximo 5MB.");
      } else if (rejection.errors[0]?.code === "file-invalid-type") {
        setDragError("Solo se permiten archivos de imagen (JPG, PNG, GIF).");
      } else {
        setDragError("Archivo no válido.");
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setDragError("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "patente") {
      const upperValue = value.toUpperCase();
      setFormData((prevData) => ({ ...prevData, [name]: upperValue }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const fetchInsurancesData = async () => {
    try {
      const data = await getInsurances();
      console.log(data);
      setInsurances(data);
    } catch (error) {
      console.error("Error fetching insurances:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDragError("");

    try {
      const patenteRegex = /^[A-Z]{2,3}[0-9]{3}[A-Z]{0,2}$/;
      if (!patenteRegex.test(formData.patente)) {
        setError("La patente debe tener el formato ABC123 o AB123CD");
        setIsLoading(false);
        return;
      }

      const formDataToSend = new FormData();

      formDataToSend.append("marca", formData.marca);
      formDataToSend.append("modelo", formData.modelo);
      formDataToSend.append("anio", formData.anio);
      formDataToSend.append("color", formData.color);
      formDataToSend.append("costo", formData.costo);
      formDataToSend.append("patente", formData.patente);
      formDataToSend.append(
        "periodicidadMantenimineto",
        formData.periodicidadMantenimineto
      );

      if (formData.id_seguro) {
        formDataToSend.append("id_seguro", formData.id_seguro);
      }

      if (selectedImage) {
        formDataToSend.append("imagen", selectedImage);
      }

      const response = await createAuto(formDataToSend);

    
      if (
        response ||
        response === null ||
        response === undefined ||
        response === ""
      ) {

        const modal = document.getElementById(
          "modal_auto"
        ) as HTMLDialogElement;
        if (modal) {
          modal.close();
        }

        setFormData({
          marca: "",
          modelo: "",
          anio: "",
          color: "",
          costo: "",
          patente: "",
          periodicidadMantenimineto: "",
          id_seguro: "",
        });

        // Limpiar imagen
        setSelectedImage(null);
        setImagePreview(null);

        // Limpiar errores
        setError("");
        setDragError("");

        if (onSuccess) {
          onSuccess();
        }

        console.log("Auto creado exitosamente y modal cerrado");
      }
    } catch (error: any) {
      console.error("Error creating auto:", error);

      // Manejo específico de errores
      if (error.response?.status === 500) {
        const errorMessage =
          error.response?.data?.error || error.response?.data?.message;

        if (
          errorMessage &&
          errorMessage.includes("UNIQUE constraint failed: Automoviles.patente")
        ) {
          setError(
            `La patente "${formData.patente}" ya existe en el sistema. Por favor, verifique la patente e intente nuevamente.`
          );
        } else if (errorMessage && errorMessage.includes("patente")) {
          setError(
            "Error con la patente del vehículo. Verifique que el formato sea correcto."
          );
        } else {
          setError(
            "Error interno del servidor. Por favor, intente nuevamente más tarde."
          );
        }
      } else if (error.response?.status === 400) {
        setError(
          "Datos inválidos. Por favor, verifique todos los campos y intente nuevamente."
        );
      } else if (
        error.code === "ECONNABORTED" ||
        error.code === "NETWORK_ERROR"
      ) {
        setError(
          "Error de conexión. Verifique su conexión a internet e intente nuevamente."
        );
      } else {
        setError("Error al crear el auto. Por favor, intente nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => {
    // Limpiar formulario al abrir modal
    setFormData({
      marca: "",
      modelo: "",
      anio: "",
      color: "",
      costo: "",
      patente: "",
      periodicidadMantenimineto: "",
      id_seguro: "",
    });

    setSelectedImage(null);
    setImagePreview(null);

    setError("");
    setDragError("");

    fetchInsurancesData();

    const modal = document.getElementById("modal_auto") as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  // console.log(formData)

  return (
    <>
      <button
        className="ml-4 btn btn-neutral btn-circle transform hover:rotate-180 transition-transform duration-300"
        title="Agregar auto"
        onClick={openModal}
      >
        <Plus />
      </button>
      <dialog id="modal_auto" className="modal">
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Agregar Nuevo Auto</h3>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Marca */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Marca</span>
                  <span className="label-text-alt text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="marca"
                  value={formData.marca}
                  onChange={handleChange}
                  placeholder="Ej: Toyota, Ford, Chevrolet"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Modelo */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Modelo</span>
                  <span className="label-text-alt text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  placeholder="Ej: Corolla, Fiesta, Onix"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Año */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Año</span>
                  <span className="label-text-alt text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="anio"
                  value={formData.anio}
                  onChange={handleChange}
                  placeholder="2024"
                  min="1980"
                  max={new Date().getFullYear() + 1}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Color */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Color</span>
                  <span className="label-text-alt text-red-500">*</span>
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Seleccionar color</option>
                  <option value="Blanco">Blanco</option>
                  <option value="Negro">Negro</option>
                  <option value="Gris">Gris</option>
                  <option value="Plata">Plata</option>
                  <option value="Rojo">Rojo</option>
                  <option value="Azul">Azul</option>
                  <option value="Verde">Verde</option>
                  <option value="Amarillo">Amarillo</option>
                  <option value="Naranja">Naranja</option>
                  <option value="Marrón">Marrón</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* Costo */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Costo (ARS)</span>
                  <span className="label-text-alt text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="costo"
                  value={formData.costo}
                  onChange={handleChange}
                  placeholder="5000000"
                  min="0"
                  step="0.01"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* Patente */}
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Patente</span>
                  <span className="label-text-alt text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="patente"
                  value={formData.patente}
                  onChange={handleChange}
                  placeholder="ABC123 o AB123CD"
                  className="input input-bordered w-full"
                  pattern="[A-Z]{2,3}[0-9]{3}[A-Z]{0,2}"
                  title="Formato: ABC123 o AB123CD"
                  style={{ textTransform: "uppercase" }}
                  required
                />
              </div>
            </div>

            {/* Periodicidad de Mantenimiento */}
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text font-medium">
                  Periodicidad de Mantenimiento (días)
                </span>
                <span className="label-text-alt text-red-500">*</span>
              </label>
              <select
                name="periodicidadMantenimineto"
                value={formData.periodicidadMantenimineto}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Seleccionar periodicidad</option>
                <option value="30">30 días (mensual)</option>
                <option value="60">60 días (bimensual)</option>
                <option value="90">90 días (trimestral)</option>
                <option value="120">120 días (cuatrimestral)</option>
                <option value="180">180 días (semestral)</option>
                <option value="365">365 días (anual)</option>
              </select>
            </div>

            {/* Seguro */}
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text font-medium">Seguro</span>
              </label>
              <select
                name="id_seguro"
                value={formData.id_seguro}
                onChange={handleChange}
                className="select select-bordered w-full"
              >
                <option value="">Seleccionar seguro</option>
                {insurances.map((insurance) => (
                  <option key={insurance.id || insurance.id_seguro} value={insurance.poliza_seguro}>
                    {insurance.compañia} - {insurance.descripcion} ({insurance.poliza})
                  </option>
                ))}
              </select>
            </div>

            {/* Imagen del Auto */}
            <div className="form-control w-full mt-4">
              <label className="label">
                <span className="label-text font-medium">Imagen del Auto</span>
                <span className="label-text-alt text-gray-500">Opcional</span>
              </label>

              {imagePreview ? (
                // Preview de imagen seleccionada
                <div className="relative">
                  <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview del auto"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 btn btn-sm btn-circle btn-error"
                    title="Eliminar imagen"
                  >
                    <X size={16} />
                  </button>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">{selectedImage?.name}</span>
                    <span className="ml-2">
                      ({Math.round((selectedImage?.size || 0) / 1024)} KB)
                    </span>
                  </div>
                </div>
              ) : (
                // Dropzone
                <div
                  {...getRootProps()}
                  className={`
                    w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
                    transition-all duration-200 flex flex-col items-center justify-center
                    ${
                      isDragActive
                        ? "border-primary bg-primary/10"
                        : "border-gray-300 hover:border-gray-400 bg-gray-50"
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 text-center px-2">
                    {isDragActive ? (
                      "Suelta la imagen aquí"
                    ) : (
                      <>
                        <span className="font-medium">
                          Haz clic para seleccionar
                        </span>
                        <span className="block">
                          o arrastra una imagen aquí
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF hasta 5MB
                  </p>
                </div>
              )}

              {dragError && (
                <div className="alert alert-error mt-2">
                  <span className="text-sm">{dragError}</span>
                </div>
              )}
            </div>

            <div className="modal-action mt-6">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save /> Guardar Auto
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn"
                disabled={isLoading}
                onClick={() => {
                  const modal = document.getElementById(
                    "modal_auto"
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
