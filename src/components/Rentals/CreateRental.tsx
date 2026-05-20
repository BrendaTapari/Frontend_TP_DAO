import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { useLocation } from "wouter";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import { Car, Calendar, Palette, Hash, CheckCircle, User, Globe, IdCard, Briefcase, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import CoveredCarImage from "../../images/CoveredCar.jpg";

import { getAviableCarsForRental } from "../../services/autosService";
import { createRental } from "../../services/rentalService";
import { sendReservationConfirmation } from "../../services/emailService";

interface CarOption {
  id: number;
  marca: string;
  modelo: string;
  patente: string;
  costo: number;
  imagen?: string;
  color?: string;
  año?: number;
}



export default function CreateRental() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [cars, setCars] = useState<CarOption[]>([]);
  const [isFetchingCars, setIsFetchingCars] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const maxDateObj = new Date();
  maxDateObj.setFullYear(maxDateObj.getFullYear() - 17);
  const maxDateString = maxDateObj.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    nacionalidad: "",
    dni: "",
    tipo_dni: "",
    fechaDeNacimiento: maxDateString,
    fechaInicio: "",
    fechaFin: "",
    auto: "", // will store car id as string
    costo: 0,
  });

  const dateCalculations = useMemo(() => {
    if (!formData.fechaInicio || !formData.fechaFin)
      return { isValid: false, days: 0 };
    const start = new Date(formData.fechaInicio + "T12:00:00");
    const end = new Date(formData.fechaFin + "T12:00:00");
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end)
      return { isValid: false, days: 0 };
    const msPerDay = 1000 * 60 * 60 * 24;
    const days = Math.ceil((end.getTime() - start.getTime()) / msPerDay);
    return { isValid: true, days };
  }, [formData.fechaInicio, formData.fechaFin]);



  useEffect(() => {
    // fetch available cars when dates change
    const fetchCars = async () => {
      if (!dateCalculations.isValid) {
        setCars([]);
        setSelectedCarId(null);
        setFormData((p) => ({ ...p, costo: 0 }));
        return;
      }
      setIsFetchingCars(true);
      try {
        const res = await getAviableCarsForRental(
          formData.fechaInicio,
          formData.fechaFin,
        );
        const list = (res || []).map((c: any) => ({
          id: c.id,
          marca: c.marca,
          modelo: c.modelo,
          patente: c.patente,
          costo: c.costo,
          imagen: c.imagen,
          color: c.color,
          año: c.año,
        }));
        setCars(list);
        // clear selection if not present
        if (
          selectedCarId &&
          !list.some((c: CarOption) => c.id === selectedCarId)
        ) {
          setSelectedCarId(null);
          setFormData((p) => ({ ...p, auto: "" }));
        }
      } catch (err) {
        toast.error(t("create_rental.error_fetch_cars", "Error al buscar autos disponibles"));
      } finally {
        setIsFetchingCars(false);
      }
    };

    fetchCars();
  }, [
    formData.fechaInicio,
    formData.fechaFin,
    dateCalculations.isValid,
    selectedCarId,
  ]);

  const getImageUrl = (imagen?: string) => {
    if (!imagen) return CoveredCarImage;
    if (
      imagen.startsWith("/") ||
      imagen.startsWith("http://") ||
      imagen.startsWith("https://")
    )
      return imagen;
    return `data:image/jpeg;base64,${imagen}`;
  };

  useEffect(() => {
    // calculate cost when car or days change
    if (!dateCalculations.isValid || !formData.auto) {
      setFormData((p) => ({ ...p, costo: 0 }));
      return;
    }
    const sel = cars.find((c) => String(c.id) === formData.auto);
    if (sel)
      setFormData((p) => ({ ...p, costo: sel.costo * dateCalculations.days }));
  }, [dateCalculations.days, dateCalculations.isValid, formData.auto, cars]);

  const handleCarSelection = useCallback((id: number) => {
    setSelectedCarId(id);
    setFormData((p) => ({ ...p, auto: String(id) }));
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((p) => ({ ...p, [name]: value }));
    },
    [],
  );

  const handleDateValidation = async () => {
    if (!formData.fechaInicio || !formData.fechaFin) {
      toast.error(t("create_rental.error_select_dates", "Por favor seleccione inicio y fin"));
      return false;
    }
    const start = new Date(formData.fechaInicio);
    const end = new Date(formData.fechaFin);
    if (start >= end) {
      toast.error(t("create_rental.error_date_order", "La fecha de inicio debe ser anterior a la fecha de fin"));
      return false;
    }
    return true;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const ok = await handleDateValidation();
      if (ok) setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      if (!formData.auto) {
        toast.error(t("create_rental.error_select_car", "Por favor seleccione un auto"));
        return;
      }
      setCurrentStep(3);
      return;
    }
    if (currentStep === 3) {
      if (
        !formData.nombre ||
        !formData.apellido ||
        !formData.email ||
        !formData.dni ||
        !formData.tipo_dni ||
        !formData.fechaDeNacimiento
      ) {
        toast.error(t("create_rental.error_missing_data", "Complete todos los datos personales solicitados"));
        return;
      }
      setCurrentStep(4);
      return;
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await handleDateValidation();
    if (!ok) return;
    try {
      setIsLoading(true);
      const payload = {
        cliente: {
          nombre: formData.nombre,
          apellido: formData.apellido,
          nacionalidad: formData.nacionalidad,
          dni: formData.dni,
          tipo_dni: formData.tipo_dni,
          fechaDeNacimiento: formData.fechaDeNacimiento,
        },
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
        autoId: Number(formData.auto),
        costo: formData.costo,
      };
      // Simulación de creación de alquiler porque el backend está desconectado
      // await createRental(payload as any);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Enviar correo de confirmación
      const selectedCar = cars.find(c => c.id === Number(formData.auto));
      if (selectedCar && formData.email) {
        console.log("Intentando enviar correo a:", formData.email);
        try {
          await sendReservationConfirmation({
            to_name: `${formData.nombre} ${formData.apellido}`,
            to_email: formData.email,
            car_brand: selectedCar.marca,
            car_model: selectedCar.modelo,
            start_date: formData.fechaInicio,
            end_date: formData.fechaFin,
            total_cost: new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(formData.costo),
          });
        } catch (emailErr) {
          console.error("No se pudo enviar el correo:", emailErr);
          // Falla silente para el usuario, ya que el alquiler se creó.
        }
      }

      toast.success(t("create_rental.success_create", "Alquiler creado"));
      setLocation("/car-rentals");
    } catch (err) {
      console.error(err);
      toast.error(t("create_rental.error_create", "Error al crear el alquiler"));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-center mt-10 mb-6">
              {t("create_rental.step1_title", "Selecciona las fechas")}
            </h2>
            {formData.fechaInicio && formData.fechaFin && (
              <div className="text-center">
                <div className="stat bg-base-200  rounded-lg inline-block">
                  <div className="stat-title text-lg text-gray-50">{t("create_rental.duration", "Duración del alquiler:")}</div>
                  <div className="stat-value text-primary">
                    {dateCalculations.days} {t("create_rental.days", "días")}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center w-full">
              <div className="form-control w-full max-w-4xl">
                <label className="label justify-center pb-4">
                  <span className="label-text font-medium text-xl text-base-content">
                    {t("create_rental.select_period", "Seleccione el período de alquiler")}
                  </span>
                </label>
                <div className="flex flex-col items-center w-full text-center space-y-4">
                  <div className="bg-base-200 border border-base-300 rounded-2xl p-4 text-base-content w-full max-w-xl font-medium text-lg shadow-sm">
                    {formData.fechaInicio
                      ? formData.fechaFin
                        ? `${new Date(formData.fechaInicio + "T12:00:00").toLocaleDateString()} — ${new Date(formData.fechaFin + "T12:00:00").toLocaleDateString()}`
                        : `${new Date(formData.fechaInicio + "T12:00:00").toLocaleDateString()} — ${t("create_rental.select_end", "Seleccione fin")}`
                      : t("create_rental.start_end_dates", "Fechas de inicio y fin")}
                  </div>

                  <div 
                    className="bg-base-200 border border-base-300 rounded-2xl p-4 text-base-content shadow-xl inline-block overflow-hidden"
                    style={{
                      "--rdp-accent-color": "oklch(var(--p))",
                      "--rdp-background-color": "oklch(var(--p) / 0.1)",
                      "--rdp-accent-color-dark": "oklch(var(--p))",
                      "--rdp-background-color-dark": "oklch(var(--p) / 0.1)",
                      "--rdp-outline-color": "oklch(var(--p))"
                    } as React.CSSProperties}
                  >
                    <DayPicker
                      locale={es}
                      className="react-day-picker"
                      mode="range"
                      numberOfMonths={2}
                      selected={{
                        from: formData.fechaInicio
                          ? new Date(formData.fechaInicio + "T12:00:00")
                          : undefined,
                        to: formData.fechaFin
                          ? new Date(formData.fechaFin + "T12:00:00")
                          : undefined,
                      }}
                      disabled={{ before: new Date() }}
                      onSelect={(range) => {
                        let inicio = "";
                        let fin = "";
                        if (range?.from) {
                          inicio = `${range.from.getFullYear()}-${String(range.from.getMonth() + 1).padStart(2, "0")}-${String(range.from.getDate()).padStart(2, "0")}`;
                        }
                        if (range?.to) {
                          fin = `${range.to.getFullYear()}-${String(range.to.getMonth() + 1).padStart(2, "0")}-${String(range.to.getDate()).padStart(2, "0")}`;
                        }
                        setFormData((p) => ({
                          ...p,
                          fechaInicio: inicio,
                          fechaFin: fin,
                          auto: "",
                        }));
                        setSelectedCarId(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mt-15 mb-6">
              {t("create_rental.step2_title", "Selecciona el auto")}
            </h2>

            {isFetchingCars ? (
              <div className="text-center">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="text-lg text-gray-200 mt-2">
                  {t("create_rental.searching_cars", "Buscando autos disponibles...")}
                </p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center">
                <p className="text-lg text-gray-200">
                  {t("create_rental.no_cars_available", "No hay autos disponibles para estas fechas")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {cars.map((carItem) => (
                  <div
                    key={carItem.id}
                    className={`card bg-base-100 text-base-content w-full shadow-md cursor-pointer transition-all duration-300 relative overflow-hidden group ${selectedCarId === carItem.id ? "ring-2 ring-primary shadow-xl shadow-primary/20 scale-[1.02]" : "hover:scale-[1.02] hover:shadow-xl"}`}
                    onClick={() => handleCarSelection(carItem.id)}
                  >
                    {selectedCarId === carItem.id && (
                      <div className="absolute top-4 right-4 z-20 bg-primary text-primary-content rounded-full p-1 shadow-lg">
                        <CheckCircle size={28} />
                      </div>
                    )}
                    <figure className="h-56 relative bg-base-300 overflow-hidden">
                      {carItem.imagen ? (
                        <img
                          src={getImageUrl(carItem.imagen)}
                          alt={`${carItem.marca} ${carItem.modelo}`}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = "/images/car-placeholder.jpg";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300">
                          <Car size={64} className="text-base-content/30" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-base-100 to-transparent z-10" />
                    </figure>
                    <div className="card-body p-6 pt-2 relative z-20">
                      <div className="mb-2">
                        <p className="uppercase tracking-widest text-xs font-semibold text-primary mb-1">
                          {carItem.marca}
                        </p>
                        <h2 className="card-title text-2xl font-bold text-base-content">
                          {carItem.modelo}
                        </h2>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 my-4">
                        <div className="badge badge-neutral badge-lg gap-2 py-3 px-3 shadow-sm font-medium">
                          <Hash size={14} className="opacity-70" /> {carItem.patente}
                        </div>
                        {carItem.año && (
                          <div className="badge badge-outline badge-lg gap-2 py-3 px-3 shadow-sm border-base-content/20 text-base-content font-medium">
                            <Calendar size={14} className="opacity-70" /> {carItem.año}
                          </div>
                        )}
                        {carItem.color && (
                          <div className="badge badge-outline badge-lg gap-2 py-3 px-3 shadow-sm border-base-content/20 text-base-content font-medium">
                            <Palette size={14} className="opacity-70" /> {carItem.color}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-base-content/10">
                        <div>
                          <p className="text-xs text-base-content/60 uppercase tracking-wider mb-1">{t("create_rental.cost_per_day", "Costo por día")}</p>
                          <p className="text-2xl font-black text-success drop-shadow-sm">
                            {new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                              maximumFractionDigits: 0
                            }).format(carItem.costo)}
                            <span className="text-sm font-normal text-base-content/60 ml-1">/día</span>
                          </p>
                        </div>
                        <div className="card-actions">
                          <button
                            type="button"
                            className={`btn ${selectedCarId === carItem.id ? "btn-primary shadow-lg shadow-primary/40" : "btn-outline border-base-content/20 hover:bg-base-200 hover:text-base-content"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCarSelection(carItem.id);
                            }}
                          >
                            {selectedCarId === carItem.id ? t("create_rental.selected", "Seleccionado") : t("create_rental.rent_btn", "Alquilar")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.auto && formData.fechaInicio && formData.fechaFin && (
              <div className="text-center mt-8">
                <div className="stat bg-base-200 text-gray-100 rounded-lg inline-block">
                  <div className="stat-title">{t("create_rental.estimated_cost", "Costo total estimado")}</div>
                  <div className="stat-value text-success">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(formData.costo)}
                  </div>
                  <div className="stat-desc">
                    {dateCalculations.days} {t("create_rental.rental_days", "días de alquiler")}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-8 text-base-content">
              {t("create_rental.client_data", "Datos del cliente")}
            </h2>

            <div className="card bg-base-200/60 backdrop-blur-sm shadow-xl border border-base-content/5 overflow-visible">
              <div className="card-body p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  
                  {/* Nombre */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                        <User size={16} className="text-primary" /> {t("create_rental.name", "Nombre")}
                      </span>
                    </label>
                    <input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      aria-label="Nombre"
                    />
                  </div>

                  {/* Apellido */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                        <User size={16} className="text-primary opacity-0" /> {t("create_rental.last_name", "Apellido")}
                      </span>
                    </label>
                    <input
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      aria-label="Apellido"
                    />
                  </div>

                  {/* Correo Electrónico */}
                  <div className="form-control md:col-span-2">
                    <label className="label pb-1">
                      <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                        <Mail size={16} className="text-primary" /> {t("create_rental.email", "Correo electrónico")}
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      aria-label="Email"
                      placeholder="Ej. cliente@correo.com"
                    />
                  </div>

                  <div className="divider md:col-span-2 my-0"></div>

                  {/* Tipo de Documento */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                        <IdCard size={16} className="text-primary" /> {t("create_rental.doc_type", "Tipo de documento")}
                      </span>
                    </label>
                    <select
                      name="tipo_dni"
                      value={formData.tipo_dni}
                      onChange={handleInputChange}
                      className="select select-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      aria-label="Tipo de documento"
                    >
                      <option value="" disabled>{t("create_rental.select_type", "Seleccione tipo")}</option>
                      <option value="DNI">DNI</option>
                      <option value="PAS">{t("create_rental.passport", "Pasaporte")}</option>
                    </select>
                  </div>

                  {/* Número de documento */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                        <span className="w-4"></span> {t("create_rental.doc_number", "Número de documento")}
                      </span>
                    </label>
                    <input
                      name="dni"
                      value={formData.dni}
                      onChange={handleInputChange}
                      className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      aria-label="Documento"
                    />
                  </div>

                  {/* Nacionalidad */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                        <Globe size={16} className="text-primary" /> {t("create_rental.nationality", "Nacionalidad")}
                      </span>
                    </label>
                    <input
                      name="nacionalidad"
                      value={formData.nacionalidad}
                      onChange={handleInputChange}
                      className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      aria-label="Nacionalidad"
                    />
                  </div>

                  {/* Fecha de nacimiento */}
                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                        <Calendar size={16} className="text-primary" /> {t("create_rental.birth_date", "Fecha de nacimiento")}
                      </span>
                    </label>
                    <input
                      type="date"
                      name="fechaDeNacimiento"
                      value={formData.fechaDeNacimiento}
                      max={maxDateString}
                      onChange={handleInputChange}
                      className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      aria-label="Fecha de nacimiento"
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>
        );

      case 4: {
        const sel = cars.find((c) => c.id === selectedCarId) as
          | CarOption
          | undefined;
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center mb-6">
              {t("create_rental.confirm_details", "Confirma los detalles")}
            </h2>

            <div className="card bg-base-200 text-base-content shadow-xl max-w-2xl mx-auto">
              <div className="card-body">
                <h3 className="card-title">{t("create_rental.summary", "Resumen del alquiler")}</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">{t("create_rental.dates", "Fechas")}:</p>
                      <p>
                        {t("create_rental.from", "Desde")}:{" "}
                        {formData.fechaInicio
                          ? new Date(formData.fechaInicio).toLocaleDateString()
                          : "-"}
                      </p>
                      <p>
                        {t("create_rental.to", "Hasta")}:{" "}
                        {formData.fechaFin
                          ? new Date(formData.fechaFin).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">{t("create_rental.car", "Auto")}:</p>
                      <p>{sel ? `${sel.marca} ${sel.modelo}` : "-"}</p>
                      <p>{t("create_rental.license_plate", "Patente")}: {sel?.patente || "-"}</p>
                    </div>
                  </div>

                  <div className="divider" />

                  <div>
                    <p className="font-semibold">{t("create_rental.client_label", "Cliente")}:</p>
                    <p>
                      {formData.nombre} {formData.apellido}
                    </p>
                    <p>
                      {formData.tipo_dni}: {formData.dni}
                    </p>
                    <p>{t("create_rental.nationality", "Nacionalidad")}: {formData.nacionalidad}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {t("create_rental.total", "Total")}:{" "}
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(formData.costo || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-8">
      <div className="container mx-auto px-4">
        {renderStepContent()}

        <div className="flex justify-between max-w-3xl mx-auto mt-8">
          <button
            type="button"
            onClick={handlePrevStep}
            className="btn btn-ghost"
            disabled={currentStep === 1}
          >
            {t("create_rental.back", "Volver")}
          </button>
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="btn btn-primary"
            >
              {t("create_rental.next", "Siguiente")}
            </button>
          ) : (
            <button
              type="submit"
              className={`btn btn-success ${isLoading ? "loading" : ""}`}
            >
              {t("create_rental.confirm", "Confirmar y crear")}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
