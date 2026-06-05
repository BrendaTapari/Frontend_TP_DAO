import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ChangeEvent,
} from "react";
import { useLocation } from "wouter";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { es, enUS, fr, de, pt, ar as arLocale } from "date-fns/locale";
import toast from "react-hot-toast";
import {
  Car,
  Calendar,
  CheckCircle,
  User,
  Globe,
  IdCard,
  Mail,
  Info,
  Users,
  Briefcase,
  Settings2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import CoveredCarImage from "../../images/CoveredCar.jpg";
import Tilt from "react-parallax-tilt";
import { getAviableCarsForRental } from "../../services/autosService";
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
  tipoVehiculo: string;
  caja?: string;
  cant_pasajeros?: number;
  litros_baul?: number;
}

interface CountryOption {
  code: string;
  label: string;
}

const inferVehicleType = (car: {
  modelo?: string;
  marca?: string;
  cant_pasajeros?: number;
  litros_baul?: number;
}) => {
  const model = `${car.marca ?? ""} ${car.modelo ?? ""}`.toLowerCase();

  if (
    /(suv|cross|tracker|rav4|taos|bronco|compass|tucson|kick|q5|x1|gla)/.test(
      model,
    )
  ) {
    return "SUV";
  }

  if (/(corolla|civic|a3|sedan|sedán)/.test(model)) {
    return "Sedán";
  }

  if (car.cant_pasajeros && car.cant_pasajeros >= 7) {
    return "Familiar";
  }

  if (car.litros_baul && car.litros_baul >= 500) {
    return "Familiar";
  }

  return "Compacto";
};

const pickupLocations: Record<string, string[]> = {
  "Buenos Aires": [
    "Aeropuerto Internacional de San Fernando",
    "Aeropuerto Internacional Ministro Pistarini (Ezeiza)",
    "Aeroparque Internacional Jorge Newbery",
    "Terminal de Cruceros Quinquela Martín",
    "Palacio Duhau - Park Hyatt Buenos Aires",
    "Four Seasons Hotel Buenos Aires",
    "Alvear Palace Hotel",
    "Faena Hotel Buenos Aires",
    "Alvear Icon Hotel & Residences",
    "Sofitel Buenos Aires Recoleta"
  ],
  "Córdoba": [
    "Aeropuerto Internacional Ingeniero Aeronáutico Ambrosio Taravella",
    "Aeroclub La Cumbre",
    "Aeroclub Alta Gracia",
    "Azur Real Hotel Boutique",
    "Windsor Hotel & Tower",
    "Quinto Centenario Hotel",
    "Estancia La Paz Hotel, Golf & Polo",
    "El Colibrí - Estancia de Charme",
    "Pueblo Nativo Resort Golf & Spa"
  ],
  "Mendoza": [
    "Aeropuerto Internacional Gobernador Francisco Gabrielli",
    "Aeroclub Mendoza",
    "Cavas Wine Lodge",
    "The Vines Resort & Spa",
    "Casa de Uco Vineyards & Wine Resort",
    "SB Winemaker's House & Spa Suites",
    "Park Hyatt Mendoza Hotel, Casino & Spa"
  ],
  "Río Negro y Neuquén": [
    "Aeropuerto Internacional Teniente Luis Candelaria",
    "Aeropuerto Aviador Carlos Campos",
    "Llao Llao Resort, Golf & Spa",
    "Arelauquen Lodge, a Tribute Portfolio Hotel",
    "Correntoso Lake & River Hotel",
    "Las Balsas Relais & Châteaux",
    "Loi Suites Chapelco Hotel"
  ],
  "Entre Ríos": [
    "Aeropuerto General Justo José de Urquiza",
    "Aeropuerto Comodoro Pierrestegui",
    "Los Ombúes Lodge",
    "Estancia Santa Rosa",
    "River Plate Wingshooting & Big Game Lodges",
    "Estancia La Pelada"
  ],
  "Salta": [
    "Aeropuerto Internacional Martín Miguel de Güemes",
    "Grace Cafayate",
    "House of Jasmines Relais & Châteaux",
    "Estancia Colomé",
    "Alejandro 1º Hotel"
  ],
  "Tierra del Fuego": [
    "Aeropuerto Internacional Malvinas Argentinas",
    "Arakur Ushuaia Resort & Spa",
    "Los Cauquenes Resort & Spa",
    "Las Hayas Ushuaia Resort"
  ]
};

export default function CreateRental() {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();
  const customArLocale = {
    ...arLocale,
    options: {
      ...arLocale.options,
      weekStartsOn: 1,
    },
  };
  const calendarLocaleMap: Record<string, typeof es> = {
    es, en: enUS, fr, de, pt, ar: customArLocale as typeof es,
  };
  const calendarLocale = calendarLocaleMap[i18n.language] ?? es;
  const chauffeurCostPerDay = 150000;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isMobileCalendar, setIsMobileCalendar] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [priceFilterMin, setPriceFilterMin] = useState("");
  const [priceFilterMax, setPriceFilterMax] = useState("");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("all");
  const [cars, setCars] = useState<CarOption[]>([]);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isFetchingCars, setIsFetchingCars] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateCalendarLayout = () => {
      setIsMobileCalendar(mediaQuery.matches);
    };

    updateCalendarLayout();
    mediaQuery.addEventListener("change", updateCalendarLayout);

    return () => {
      mediaQuery.removeEventListener("change", updateCalendarLayout);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadCountries = async () => {
      setIsLoadingCountries(true);

      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2,translations,demonyms",
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error("No se pudieron cargar las nacionalidades");
        }

        const data = await response.json();

        const options = (
          data as Array<{
            cca2?: string;
            name?: { common?: string };
            translations?: { spa?: { common?: string } };
          }>
        )
          .map((country) => ({
            code: country.cca2 ?? "",
            label:
              country.translations?.spa?.common ?? country.name?.common ?? "",
          }))
          .filter((country) => country.code && country.label)
          .sort((a, b) => a.label.localeCompare(b.label, "es"));

        setCountries(options);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          toast.error(
            t(
              "create_rental.error_load_countries",
              "No se pudieron cargar las nacionalidades",
            ),
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCountries(false);
        }
      }
    };

    loadCountries();

    return () => controller.abort();
  }, [t]);

  const maxDateObj = new Date();
  maxDateObj.setFullYear(maxDateObj.getFullYear() - 17);
  const maxDateString = maxDateObj.toISOString().split("T")[0];

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
    retiroTipo: "sucursal",
    retiroProvincia: "",
    retiroLugar: "",
    requiereChofer: "no",
    tarjetaNumero: "",
    tarjetaNombre: "",
    tarjetaExpiracion: "",
    tarjetaCVV: "",
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

  const chauffeurCost = useMemo(() => {
    if (!dateCalculations.isValid || formData.requiereChofer !== "si") {
      return 0;
    }
    return dateCalculations.days * chauffeurCostPerDay;
  }, [
    dateCalculations.days,
    dateCalculations.isValid,
    formData.requiereChofer,
  ]);

  const totalAmount = useMemo(
    () => formData.costo + chauffeurCost,
    [formData.costo, chauffeurCost],
  );

  const availableVehicleTypes = useMemo(() => {
    return Array.from(new Set(cars.map((car) => car.tipoVehiculo))).sort();
  }, [cars]);

  const priceThresholds = [80000, 100000, 120000, 150000];

  const filteredCars = useMemo(() => {
    const minPrice = priceFilterMin ? Number(priceFilterMin) : null;
    const maxPrice = priceFilterMax ? Number(priceFilterMax) : null;

    return cars.filter((car) => {
      if (minPrice !== null && car.costo < minPrice) return false;
      if (maxPrice !== null && car.costo > maxPrice) return false;
      if (
        vehicleTypeFilter !== "all" &&
        car.tipoVehiculo !== vehicleTypeFilter
      ) {
        return false;
      }
      return true;
    });
  }, [cars, priceFilterMin, priceFilterMax, vehicleTypeFilter]);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setLocation("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showSuccessModal, setLocation]);
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
          caja: c.caja,
          cant_pasajeros: c.cant_pasajeros,
          litros_baul: c.litros_baul,
          tipoVehiculo:
            c.tipoVehiculo ?? c.tipo_vehiculo ?? inferVehicleType(c),
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
        toast.error(
          t(
            "create_rental.error_fetch_cars",
            "Error al buscar autos disponibles",
          ),
        );
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

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatCardExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const isValidCardExpiry = (value: string) => {
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;
    const month = Number(value.slice(0, 2));
    const year = Number(`20${value.slice(3, 5)}`);

    if (month < 1 || month > 12 || Number.isNaN(year)) return false;

    const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);
    return expiryDate > new Date();
  };

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      if (name === "retiroProvincia") {
        setFormData((p) => ({ ...p, [name]: value, retiroLugar: "" }));
        return;
      }
      if (name === "tarjetaNumero") {
        setFormData((p) => ({ ...p, [name]: formatCardNumber(value) }));
        return;
      }
      if (name === "tarjetaExpiracion") {
        setFormData((p) => ({ ...p, [name]: formatCardExpiry(value) }));
        return;
      }
      if (name === "tarjetaCVV") {
        setFormData((p) => ({
          ...p,
          [name]: value.replace(/\D/g, "").slice(0, 4),
        }));
        return;
      }
      if (name === "nombre" || name === "apellido" || name === "tarjetaNombre") {
        let filteredValue = value;
        if (i18n.language === "ar") {
          filteredValue = value.replace(/[^\u0600-\u06FF\s]/g, "");
        } else {
          filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑçÇàèìòùÀÈÌÒÙäëïöüÄËÏÖÜ\s]/g, "");
        }
        setFormData((p) => ({
          ...p,
          [name]: filteredValue,
        }));
        return;
      }
      setFormData((p) => ({ ...p, [name]: value }));
    },
    [i18n.language],
  );

  const handleDateValidation = async () => {
    if (!formData.fechaInicio || !formData.fechaFin) {
      toast.error(
        t(
          "create_rental.error_select_dates",
          "Por favor seleccione inicio y fin",
        ),
      );
      return false;
    }
    const start = new Date(formData.fechaInicio);
    const end = new Date(formData.fechaFin);
    if (start >= end) {
      toast.error(
        t(
          "create_rental.error_date_order",
          "La fecha de inicio debe ser anterior a la fecha de fin",
        ),
      );
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
        toast.error(
          t("create_rental.error_select_car", "Por favor seleccione un auto"),
        );
        return;
      }
      setCurrentStep(3);
      return;
    }
    if (currentStep === 3) {
      if (formData.retiroTipo === "otro" && (!formData.retiroProvincia.trim() || !formData.retiroLugar.trim())) {
        toast.error(
          t(
            "create_rental.error_pickup_location",
            "Indique dónde desea retirar el auto",
          ),
        );
        return;
      }

      setCurrentStep(4);
      return;
    }
    if (currentStep === 4) {
      const cardNumberDigits = formData.tarjetaNumero.replace(/\D/g, "");
      if (
        !formData.nombre ||
        !formData.apellido ||
        !formData.email ||
        !formData.dni ||
        !formData.tipo_dni ||
        !formData.fechaDeNacimiento ||
        !formData.tarjetaNumero ||
        !formData.tarjetaNombre ||
        !formData.tarjetaExpiracion ||
        !formData.tarjetaCVV
      ) {
        toast.error(
          t(
            "create_rental.error_missing_data",
            "Complete todos los datos personales y de pago solicitados",
          ),
        );
        return;
      }

      if (cardNumberDigits.length !== 16) {
        toast.error(
          t(
            "create_rental.error_card_number",
            "El número de tarjeta debe tener 16 dígitos",
          ),
        );
        return;
      }

      if (!isValidCardExpiry(formData.tarjetaExpiracion)) {
        toast.error(
          t(
            "create_rental.error_card_expiry",
            "La fecha de vencimiento debe tener formato xx/xx",
          ),
        );
        return;
      }

      if (!/^\d{1,4}$/.test(formData.tarjetaCVV)) {
        toast.error(
          t(
            "create_rental.error_card_cvv",
            "El código de seguridad debe contener solo números y hasta 4 dígitos",
          ),
        );
        return;
      }

      setCurrentStep(5);
      return;
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleFinalCreate = async () => {
    const ok = await handleDateValidation();
    if (!ok) return;

    if (formData.retiroTipo === "otro" && (!formData.retiroProvincia.trim() || !formData.retiroLugar.trim())) {
      toast.error(
        t(
          "create_rental.error_pickup_location",
          "Indique dónde desea retirar el auto",
        ),
      );
      return;
    }

    const cardNumberDigits = formData.tarjetaNumero.replace(/\D/g, "");
    if (cardNumberDigits.length !== 16) {
      toast.error(
        t(
          "create_rental.error_card_number",
          "El número de tarjeta debe tener 16 dígitos",
        ),
      );
      return;
    }

    if (!isValidCardExpiry(formData.tarjetaExpiracion)) {
      toast.error(
        t(
          "create_rental.error_card_expiry",
          "La fecha de vencimiento debe tener formato xx/xx",
        ),
      );
      return;
    }

    if (!/^\d{1,4}$/.test(formData.tarjetaCVV)) {
      toast.error(
        t(
          "create_rental.error_card_cvv",
          "El código de seguridad debe contener solo números y hasta 4 dígitos",
        ),
      );
      return;
    }

    try {
      setIsLoading(true);
      // Simulación de creación de alquiler porque el backend está desconectado
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Enviar correo de confirmación
      const selectedCar = cars.find((c) => c.id === Number(formData.auto));
      if (selectedCar && formData.email) {
        console.log("Intentando enviar correo a:", formData.email);
        try {
          const qrData = `Reserva: ${selectedCar.marca} ${selectedCar.modelo}\nCliente: ${formData.nombre} ${formData.apellido}\nFechas: ${formData.fechaInicio} a ${formData.fechaFin}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

          await sendReservationConfirmation({
            to_name: `${formData.nombre} ${formData.apellido}`,
            to_email: formData.email,
            car_brand: selectedCar.marca,
            car_model: selectedCar.modelo,
            start_date: formData.fechaInicio,
            end_date: formData.fechaFin,
            total_cost: new Intl.NumberFormat("es-AR", {
              style: "currency",
              currency: "ARS",
              maximumFractionDigits: 0,
            }).format(totalAmount),
            qr_code_url: qrUrl,
          });
        } catch (emailErr) {
          console.error("No se pudo enviar el correo:", emailErr);
          // Falla silente para el usuario, ya que el alquiler se creó.
        }
      }

      toast.success(t("create_rental.success_create", "Alquiler creado"));
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      toast.error(
        t("create_rental.error_create", "Error al crear el alquiler"),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-center mt-15 mb-6">
              {t("create_rental.step1_title", "Selecciona el periodo de alquiler")}
            </h2>
            {formData.fechaInicio && formData.fechaFin && (
              <div className="text-center">
                <div className="stat bg-base-200  rounded-lg inline-block">
                  <div className="stat-title text-lg text-gray-50">
                    {t("create_rental.duration", "Duración del alquiler:")}
                  </div>
                  <div className="stat-value text-primary">
                    {dateCalculations.days} {t("create_rental.days", "días")}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center w-full">
              <div className="form-control w-full max-w-4xl">
                <div className="flex flex-col items-center w-full text-center space-y-4">
                  <div className="bg-base-200 border border-base-300 rounded-2xl p-4 text-base-content w-full max-w-xl font-medium text-lg shadow-sm">
                    {formData.fechaInicio
                      ? formData.fechaFin
                        ? `${new Date(formData.fechaInicio + "T12:00:00").toLocaleDateString()} — ${new Date(formData.fechaFin + "T12:00:00").toLocaleDateString()}`
                        : `${new Date(formData.fechaInicio + "T12:00:00").toLocaleDateString()} — ${t("create_rental.select_end", "Seleccione fin")}`
                      : t(
                          "create_rental.start_end_dates",
                          "Fechas de inicio y fin",
                        )}
                  </div>

                  <div
                    className="bg-base-200 border border-base-300 rounded-2xl p-4 text-base-content shadow-xl inline-block overflow-hidden"
                    style={
                      {
                        "--rdp-accent-color": "oklch(var(--p))",
                        "--rdp-background-color": "oklch(var(--p) / 0.1)",
                        "--rdp-accent-color-dark": "oklch(var(--p))",
                        "--rdp-background-color-dark": "oklch(var(--p) / 0.1)",
                        "--rdp-outline-color": "oklch(var(--p))",
                      } as React.CSSProperties
                    }
                  >
                    <DayPicker
                      dir={i18n.language === "ar" ? "rtl" : "ltr"}
                      locale={calendarLocale}
                      className="react-day-picker"
                      mode="range"
                      numberOfMonths={isMobileCalendar ? 1 : 2}
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
            <h2 className="text-3xl font-semibold text-center mt-15 mb-6">
              {t("create_rental.step2_title", "Selecciona el auto")}
            </h2>

            {isFetchingCars ? (
              <div className="text-center">
                <div className="loading loading-spinner loading-lg"></div>
                <p className="text-lg text-gray-200 mt-2">
                  {t(
                    "create_rental.searching_cars",
                    "Buscando autos disponibles...",
                  )}
                </p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center">
                <p className="text-lg text-gray-200">
                  {t(
                    "create_rental.no_cars_available",
                    "No hay autos disponibles para estas fechas",
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-base-200/60 border border-base-content/10 rounded-2xl p-4 md:p-5 max-w-6xl mx-auto shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <label className="form-control">
                      <span className="label-text font-medium text-base-content/80 mb-2">
                        {t(
                          "create_rental.filter_min_price",
                          "Precio mínimo por día",
                        )}
                      </span>
                      <select
                        value={priceFilterMin}
                        onChange={(e) => setPriceFilterMin(e.target.value)}
                        className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="">
                          {t("create_rental.filter_any", "Cualquiera")}
                        </option>
                        {priceThresholds.map((threshold) => (
                          <option key={threshold} value={String(threshold)}>
                            {t("create_rental.from_ars", "Desde ARS")} {threshold.toLocaleString("es-AR")}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-control">
                      <span className="label-text font-medium text-base-content/80 mb-2">
                        {t(
                          "create_rental.filter_max_price",
                          "Precio máximo por día",
                        )}
                      </span>
                      <select
                        value={priceFilterMax}
                        onChange={(e) => setPriceFilterMax(e.target.value)}
                        className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="">
                          {t("create_rental.filter_any", "Cualquiera")}
                        </option>
                        {priceThresholds.map((threshold) => (
                          <option key={threshold} value={String(threshold)}>
                            {t("create_rental.to_ars", "Hasta ARS")} {threshold.toLocaleString("es-AR")}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-control">
                      <span className="label-text font-medium text-base-content/80 mb-2">
                        {t(
                          "create_rental.filter_vehicle_type",
                          "Tipo de vehículo",
                        )}
                      </span>
                      <select
                        value={vehicleTypeFilter}
                        onChange={(e) => setVehicleTypeFilter(e.target.value)}
                        className="select select-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                      >
                        <option value="all">
                          {t("create_rental.filter_all", "Todos")}
                        </option>
                        {availableVehicleTypes.map((type) => (
                          <option key={type} value={type}>
                            {t(`vehicle_types.${type}`, type)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setPriceFilterMin("");
                        setPriceFilterMax("");
                        setVehicleTypeFilter("all");
                      }}
                    >
                      {t("create_rental.clear_filters", "Limpiar filtros")}
                    </button>
                  </div>
                </div>

                <div className="text-center text-sm text-base-content/70">
                  {t("create_rental.filtered_results", "Resultados mostrados")}:{" "}
                  {filteredCars.length}
                </div>

                {filteredCars.length === 0 ? (
                  <div className="text-center">
                    <p className="text-lg text-gray-200">
                      {t(
                        "create_rental.no_filtered_cars",
                        "No hay autos que coincidan con los filtros seleccionados",
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {filteredCars.map((carItem) => (
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
                        <figure className="aspect-[16/9] w-full relative bg-base-300 overflow-hidden">
                          {carItem.imagen ? (
                            <img
                              src={getImageUrl(carItem.imagen)}
                              alt={`${carItem.marca} ${carItem.modelo}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "/images/car-placeholder.jpg";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-base-200 to-base-300">
                              <Car size={64} className="text-base-content/30" />
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-base-100 to-transparent z-10" />
                        </figure>
                        <div className="card-body p-3 sm:p-6 pt-2 relative z-20">
                          <div className="mb-1 sm:mb-2">
                            <p className="uppercase tracking-widest text-xs font-semibold text-primary mb-1">
                              {carItem.marca}
                            </p>
                            <h2 className="card-title text-lg sm:text-2xl font-bold text-base-content">
                              {carItem.modelo}
                            </h2>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 my-2.5 sm:my-4 text-xs sm:text-sm text-base-content/70">
                            <div className="flex items-center gap-1.5" title={t("fleet.gearbox", "Caja")}>
                              <Settings2 size={16} className="text-base-content/40" />
                              <span className="font-medium text-base-content">{carItem.caja ? t(`fleet.gearbox_${carItem.caja.toLowerCase()}`, carItem.caja) : "-"}</span>
                            </div>
                            <div className="flex items-center gap-1.5" title={t("fleet.passengers", "Pasajeros")}>
                              <Users size={16} className="text-base-content/40" />
                              <span className="font-medium text-base-content">{carItem.cant_pasajeros} {t("fleet.people", "pasajeros")}</span>
                            </div>
                            {carItem.litros_baul && (
                              <div className="flex items-center gap-1.5" title={t("fleet.trunk", "Baúl")}>
                                <Briefcase size={16} className="text-base-content/40" />
                                <span className="font-medium text-base-content">{carItem.litros_baul} L</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-2.5 sm:pt-4 border-t border-base-content/10">
                            <div>
                              <p className="text-xs text-base-content/60 uppercase tracking-wider mb-1">
                                {t(
                                  "create_rental.cost_per_day",
                                  "Costo por día",
                                )}
                              </p>
                              <p className="text-lg sm:text-2xl font-black text-success drop-shadow-sm">
                                {new Intl.NumberFormat("es-AR", {
                                  style: "currency",
                                  currency: "ARS",
                                  maximumFractionDigits: 0,
                                }).format(carItem.costo)}
                                <span className="text-[10px] sm:text-sm font-normal text-base-content/60 ml-1">
                                  {t("create_rental.per_day", "/día")}
                                </span>
                              </p>
                            </div>
                            <div className="card-actions">
                              <button
                                type="button"
                                className={`btn ${selectedCarId === carItem.id ? "btn-primary shadow-lg shadow-primary/40" : "btn-outline border-base-content/20 hover:bg-base-200 hover:text-base-content"}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (selectedCarId === carItem.id) {
                                    handleNextStep();
                                  } else {
                                    handleCarSelection(carItem.id);
                                  }
                                }}
                              >
                                {selectedCarId === carItem.id
                                  ? t("create_rental.next_step", "Siguiente paso")
                                  : t("create_rental.rent_btn", "Alquilar")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formData.auto && formData.fechaInicio && formData.fechaFin && (
              <div className="text-center mt-8">
                <div className="stat bg-base-200 text-gray-100 rounded-lg inline-block">
                  <div className="stat-title">
                    {t("create_rental.estimated_cost", "Costo total estimado")}
                  </div>
                  <div className="stat-value text-success">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(formData.costo)}
                  </div>
                  <div className="stat-desc">
                    {dateCalculations.days}{" "}
                    {t("create_rental.rental_days", "días de alquiler")}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-8 mt-15 text-base-content">
              {t("create_rental.pickup_data", "Datos de retiro")}
            </h2>

            <div className="alert alert-info bg-info/10 text-info-content border border-info/20 shadow-sm mb-6 flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span>
                {t(
                  "create_rental.special_needs_notice",
                  "En caso de necesitar una adaptación especial, llevar mascotas o necesitar sillas especiales para niños, por favor póngase en contacto con la agencia indicando su número de reserva luego de terminar el trámite de alquiler."
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="card bg-base-200/60 backdrop-blur-sm shadow-xl border border-base-content/5 overflow-visible">
                <div className="card-body p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-base-content/90">
                      {t("create_rental.pickup_method", "¿Dónde lo retiran?")}
                    </h3>
                    <p className="text-sm text-base-content/70">
                      {t(
                        "create_rental.pickup_method_help",
                        "Elegí si lo retiran en sucursal o en una ubicación específica.",
                      )}
                    </p>
                  </div>

                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium text-base-content/80">
                        {t("create_rental.pickup_type", "Lugar de envío")}
                      </span>
                    </label>
                    <select
                      name="retiroTipo"
                      value={formData.retiroTipo}
                      onChange={handleInputChange}
                      className="select select-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                    >
                      <option value="sucursal">
                        {t("create_rental.pickup_branch", "Retiro en sucursal")}
                      </option>
                      <option value="otro">
                        {t(
                          "create_rental.pickup_other",
                          "Quiero que lo envíen",
                        )}
                      </option>
                    </select>
                  </div>

                  {formData.retiroTipo === "otro" && (
                    <>
                      <div className="form-control mb-4">
                        <label className="label pb-1">
                          <span className="label-text font-medium text-base-content/80">
                            {t(
                              "create_rental.pickup_province",
                              "Provincia o Región",
                            )}
                          </span>
                        </label>
                        <select
                          name="retiroProvincia"
                          value={formData.retiroProvincia}
                          onChange={handleInputChange}
                          className="select select-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                        >
                          <option value="">
                            {t(
                              "create_rental.pickup_province_select",
                              "Seleccione una provincia",
                            )}
                          </option>
                          {Object.keys(pickupLocations).map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label pb-1">
                          <span className="label-text font-medium text-base-content/80">
                            {t(
                              "create_rental.pickup_location",
                              "Indique la ubicación",
                            )}
                          </span>
                        </label>
                        <select
                          name="retiroLugar"
                          value={formData.retiroLugar}
                          onChange={handleInputChange}
                          disabled={!formData.retiroProvincia}
                          className="select select-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                        >
                          <option value="">
                            {t(
                              "create_rental.pickup_location_select",
                              "Seleccione una ubicación",
                            )}
                          </option>
                          {formData.retiroProvincia &&
                            pickupLocations[formData.retiroProvincia]?.map((loc) => (
                              <option key={loc} value={loc}>
                                {loc}
                              </option>
                            ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="divider my-0" />

                  <div className="form-control">
                    <label className="label pb-1">
                      <span className="label-text font-medium text-base-content/80">
                        {t("create_rental.driver_option", "¿Desea chofer?")}
                      </span>
                    </label>
                    <select
                      name="requiereChofer"
                      value={formData.requiereChofer}
                      onChange={handleInputChange}
                      className="select select-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                    >
                      <option value="no">
                        {t("create_rental.driver_no", "No, solo el auto")}
                      </option>
                      <option value="si">
                        {t("create_rental.driver_yes", "Sí, con cargo extra")}
                      </option>
                    </select>
                  </div>

                  {formData.requiereChofer === "si" && (
                    <div className="alert alert-info bg-info/10 text-info-content border border-info/20">
                      <span>
                        {t(
                          "create_rental.driver_note",
                          "El servicio con chofer se cotiza como cargo adicional.",
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl border border-base-content/10 overflow-hidden">
                <div className="card-body pt-4">
                  <h3 className="card-title text-xl mb-4 text-base-content">
                    {t("create_rental.pickup_summary", "Resumen de envío")}
                  </h3>

                  <div className="space-y-3 text-sm text-base-content/80">
                    <div className="flex justify-between gap-4">
                      <span>{t("create_rental.pickup_method", "Envío")}</span>
                      <span className="font-semibold text-base-content text-right">
                        {formData.retiroTipo === "sucursal"
                          ? t("create_rental.pickup_branch", "Envío a sucursal")
                          : formData.retiroProvincia && formData.retiroLugar
                            ? `${formData.retiroProvincia} - ${formData.retiroLugar}`
                            : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>{t("create_rental.driver_option", "Chofer")}</span>
                      <span className="font-semibold text-base-content text-right">
                        {formData.requiereChofer === "si"
                          ? t("create_rental.driver_yes", "Sí, con cargo extra")
                          : t("create_rental.driver_no", "No, solo el auto")}
                      </span>
                    </div>
                    {formData.requiereChofer === "si" && (
                      <>
                        <div className="flex justify-between gap-4">
                          <span>
                            {t(
                              "create_rental.driver_cost_per_day",
                              "Chofer por día",
                            )}
                          </span>
                          <span className="font-semibold text-base-content text-right">
                            {new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                              maximumFractionDigits: 0,
                            }).format(chauffeurCostPerDay)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span>
                            {t(
                              "create_rental.driver_cost_total",
                              "Costo del chofer",
                            )}
                          </span>
                          <span className="font-semibold text-base-content text-right">
                            {new Intl.NumberFormat("es-AR", {
                              style: "currency",
                              currency: "ARS",
                              maximumFractionDigits: 0,
                            }).format(chauffeurCost)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between gap-4 pt-2 border-t border-base-content/10">
                      <span className="font-semibold text-base-content">
                        {t("create_rental.total_rental", "Total del alquiler")}
                      </span>
                      <span className="font-bold text-base-content text-right">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          maximumFractionDigits: 0,
                        }).format(totalAmount)}
                      </span>
                    </div>
                  </div>

                  {formData.retiroTipo === "otro" && formData.retiroLugar && (
                    <div className="mt-4 p-4 rounded-xl bg-base-200 border border-base-content/10 text-sm text-base-content/70">
                      {t(
                        "create_rental.pickup_summary_note",
                        "La entrega se coordinará en la ubicación indicada.",
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: {
        const selectedCar = cars.find((c) => c.id === Number(formData.auto));
        const senaAmount = totalAmount * 0.2; // Suponemos una seña del 20%

        return (
          <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-8 mt-15 text-base-content">
              {t("create_rental.client_data", "Datos del cliente y Pago")}
            </h2>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Columna Izquierda: Formularios */}
              <div className="flex-1 w-full min-w-0 flex flex-col gap-8">
                {/* Card de Datos Personales */}
                <div className="card bg-base-200/60 backdrop-blur-sm shadow-xl border border-base-content/5 overflow-visible">
                  <div className="card-body p-6 md:p-8">
                    <h3 className="text-xl font-semibold mb-6 text-base-content/90">
                      {t("create_rental.personal_data", "Datos Personales")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      {/* Nombre */}
                      <div className="form-control">
                        <label className="label pb-1">
                          <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                            <User size={16} className="text-primary" />{" "}
                            {t("create_rental.name", "Nombre")}
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
                            <User
                              size={16}
                              className="text-primary opacity-0"
                            />{" "}
                            {t("create_rental.last_name", "Apellido")}
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
                            <Mail size={16} className="text-primary" />{" "}
                            {t("create_rental.email", "Correo electrónico")}
                          </span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                          aria-label="Email"
                          placeholder={t("create_rental.email_placeholder", "Ej. cliente@correo.com")}
                        />
                      </div>

                      <div className="divider md:col-span-2 my-0"></div>

                      {/* Tipo de Documento */}
                      <div className="form-control">
                        <label className="label pb-1">
                          <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                            <IdCard size={16} className="text-primary" />{" "}
                            {t("create_rental.doc_type", "Tipo de documento")}
                          </span>
                        </label>
                        <select
                          name="tipo_dni"
                          value={formData.tipo_dni}
                          onChange={handleInputChange}
                          className="select select-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                          aria-label="Tipo de documento"
                        >
                          <option value="" disabled>
                            {t("create_rental.select_type", "Seleccione tipo")}
                          </option>
                          <option value="DNI">DNI</option>
                          <option value="PAS">
                            {t("create_rental.passport", "Pasaporte")}
                          </option>
                        </select>
                      </div>

                      {/* Número de documento */}
                      <div className="form-control">
                        <label className="label pb-1">
                          <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                            <span className="w-4"></span>{" "}
                            {t(
                              "create_rental.doc_number",
                              "Número de documento",
                            )}
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
                            <Globe size={16} className="text-primary" />{" "}
                            {t("create_rental.nationality", "Nacionalidad")}
                          </span>
                        </label>
                        <select
                          name="nacionalidad"
                          value={formData.nacionalidad}
                          onChange={handleInputChange}
                          className="select select-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                          aria-label="Nacionalidad"
                          disabled={isLoadingCountries}
                        >
                          <option value="">
                            {isLoadingCountries
                              ? t(
                                  "create_rental.loading_countries",
                                  "Cargando nacionalidades...",
                                )
                              : t(
                                  "create_rental.select_nationality",
                                  "Seleccione una nacionalidad",
                                )}
                          </option>
                          {countries.map((country) => (
                            <option key={country.code} value={country.label}>
                              {country.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Fecha de nacimiento */}
                      <div className="form-control">
                        <label className="label pb-1">
                          <span className="label-text font-medium flex items-center gap-2 text-base-content/80">
                            <Calendar size={16} className="text-primary" />{" "}
                            {t(
                              "create_rental.birth_date",
                              "Fecha de nacimiento",
                            )}
                          </span>
                        </label>
                        <input
                          type="date"
                          name="fechaDeNacimiento"
                          value={formData.fechaDeNacimiento}
                          max={maxDateString}
                          lang={i18n.language}
                          onChange={handleInputChange}
                          className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50"
                          aria-label="Fecha de nacimiento"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card de Datos de Pago */}
                  <div className="card bg-base-200/60 backdrop-blur-sm shadow-xl border border-base-content/5 overflow-visible">
                    <div className="card-body p-6 md:p-8">
                      <h3 className="text-xl font-semibold mb-6 text-base-content/90">
                        {t(
                          "create_rental.payment_data",
                          "Datos de Pago (Seña)",
                        )}
                      </h3>

                      <div className="flex flex-col xl:flex-row gap-8 items-center xl:items-center">
                        {/* Formulario de Tarjeta */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          {/* Número de Tarjeta */}
                          <div className="form-control md:col-span-2">
                            <label className="label pb-1">
                              <span className="label-text font-medium text-base-content/80">
                                {t(
                                  "create_rental.card_number",
                                  "Número de Tarjeta",
                                )}
                              </span>
                            </label>
                            <input
                              name="tarjetaNumero"
                              value={formData.tarjetaNumero}
                              onChange={handleInputChange}
                              maxLength={19}
                              placeholder="0000 0000 0000 0000"
                              inputMode="numeric"
                              pattern="[0-9 ]*"
                              className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50 font-mono tracking-widest"
                            />
                          </div>

                          {/* Nombre en la Tarjeta */}
                          <div className="form-control md:col-span-2">
                            <label className="label pb-1">
                              <span className="label-text font-medium text-base-content/80">
                                {t(
                                  "create_rental.card_name",
                                  "Titular de la Tarjeta",
                                )}
                              </span>
                            </label>
                            <input
                              name="tarjetaNombre"
                              value={formData.tarjetaNombre}
                              onChange={handleInputChange}
                              placeholder="VICTOR VON D."
                              inputMode="text"
                              pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*"
                              className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50 uppercase"
                            />
                          </div>

                          {/* Expiración */}
                          <div className="form-control">
                            <label className="label pb-1">
                              <span className="label-text font-medium text-base-content/80">
                                {t("create_rental.card_expiry", "Vencimiento")}
                              </span>
                            </label>
                            <input
                              name="tarjetaExpiracion"
                              value={formData.tarjetaExpiracion}
                              onChange={handleInputChange}
                              maxLength={5}
                              placeholder="MM/YY"
                              inputMode="numeric"
                              pattern="[0-9]{2}/[0-9]{2}"
                              className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50 text-center"
                            />
                          </div>

                          {/* CVV */}
                          <div className="form-control">
                            <label className="label pb-1">
                              <span className="label-text font-medium text-base-content/80">
                                CVV
                              </span>
                            </label>
                            <input
                              name="tarjetaCVV"
                              value={formData.tarjetaCVV}
                              onChange={handleInputChange}
                              maxLength={4}
                              inputMode="numeric"
                              pattern="[0-9]*"
                              type="password"
                              placeholder="•••"
                              className="input input-bordered w-full bg-base-100 focus:border-primary transition-colors focus:ring-1 focus:ring-primary/50 text-center"
                            />
                          </div>
                        </div>
                        {/* Visualización 3D */}
                        <div className="flex-none flex justify-center w-full sm:w-auto overflow-visible py-6">
                          <Tilt
                            tiltMaxAngleX={15}
                            tiltMaxAngleY={15}
                            perspective={1000}
                            scale={1.05}
                            transitionSpeed={400}
                            className="w-80 sm:w-96 mx-auto cursor-pointer"
                          >
                            <label
                              className={`swap swap-flip w-full h-full ${formData.tarjetaNumero || formData.tarjetaNombre || formData.tarjetaExpiracion || formData.tarjetaCVV ? "swap-active" : ""}`}
                            >
                              {/* content on (custom card) */}
                              <div className="swap-on w-full">
                                <div className="card w-full h-52 bg-black text-white bg-[radial-gradient(circle_at_bottom_left,#ffffff04_35%,transparent_36%),radial-gradient(circle_at_top_right,#ffffff04_35%,transparent_36%)] bg-size-[4.95em_4.95em] shadow-xl">
                                  <div className="card-body p-6 h-full flex flex-col justify-between relative z-10">
                                    <div className="flex justify-between mb-6">
                                      <div className="font-bold tracking-widest text-sm opacity-90">
                                        BANK OF LATVERIA
                                      </div>
                                      <div className="text-3xl opacity-20 leading-none">
                                        ❁
                                      </div>
                                    </div>
                                    <div className="text-xl sm:text-2xl font-mono mb-4 opacity-70 tracking-[0.1em] min-h-[32px]">
                                      {formData.tarjetaNumero ||
                                        "0210 8820 1150 0222"}
                                    </div>
                                    <div className="flex justify-between items-end">
                                      <div>
                                        <div className="text-[10px] opacity-40 mb-1">
                                          CARD HOLDER
                                        </div>
                                        <div className="font-semibold text-sm uppercase truncate max-w-[150px] min-h-[20px]">
                                          {formData.tarjetaNombre ||
                                            "VICTOR VON D."}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-[10px] opacity-40 mb-1">
                                          EXPIRES
                                        </div>
                                        <div className="font-mono text-sm min-h-[20px]">
                                          {formData.tarjetaExpiracion ||
                                            "29/08"}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* content off (image) */}
                              <div className="swap-off w-full">
                                <figure className="w-full rounded-2xl overflow-hidden shadow-xl">
                                  <img
                                    src="https://img.daisyui.com/images/stock/creditcard.webp"
                                    alt="3D card"
                                    className="w-full h-52 object-cover"
                                  />
                                </figure>
                              </div>
                            </label>
                          </Tilt>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Resumen a pagar */}
              <div className="w-full lg:w-96 flex-none sticky top-24">
                <div className="card bg-base-100 shadow-xl border border-base-content/10 overflow-hidden">
                  {selectedCar && (
                    <figure className="h-48 relative bg-base-300 w-full overflow-hidden">
                      <img
                        src={getImageUrl(selectedCar.imagen)}
                        alt={`${selectedCar.marca} ${selectedCar.modelo}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/images/car-placeholder.jpg";
                        }}
                      />
                      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-base-100 to-transparent z-10" />
                    </figure>
                  )}
                  <div className="card-body pt-4">
                    <h3 className="card-title text-xl mb-4 text-base-content">
                      {t("create_rental.payment_summary", "Resumen a Pagar")}
                    </h3>

                    <div className="space-y-3 text-sm text-base-content/80">
                      <div className="flex justify-between">
                        <span>{t("create_rental.selected_car", "Auto seleccionado")}</span>
                        <span className="font-semibold text-base-content">
                          {selectedCar?.marca} {selectedCar?.modelo}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("create_rental.duration_label", "Duración")}</span>
                        <span className="font-semibold text-base-content">
                          {dateCalculations.days} {t("create_rental.days", "días")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("create_rental.price_per_day", "Precio por día")}</span>
                        <span className="font-semibold text-base-content">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                            maximumFractionDigits: 0,
                          }).format(selectedCar?.costo || 0)}
                        </span>
                      </div>
                      {formData.requiereChofer === "si" && (
                        <>
                          <div className="flex justify-between">
                            <span>
                              {t("create_rental.driver_cost", "Chofer por día")}
                            </span>
                            <span className="font-semibold text-base-content">
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 0,
                              }).format(chauffeurCostPerDay)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>
                              {t(
                                "create_rental.driver_total_cost",
                                "Costo del chofer",
                              )}
                            </span>
                            <span className="font-semibold text-base-content">
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                                maximumFractionDigits: 0,
                              }).format(chauffeurCost)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="divider my-4"></div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-base-content/80">
                          {t("create_rental.total_rental", "Total del alquiler")}
                        </span>
                        <span className="font-bold text-base-content">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                            maximumFractionDigits: 0,
                          }).format(totalAmount)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-primary/10 p-4 rounded-xl border border-primary/20 mt-6">
                        <div>
                          <span className="block font-bold text-primary text-lg">
                            {t("create_rental.deposit_today", "Seña a pagar hoy")}
                          </span>
                          <span className="text-xs text-primary/70 block mt-1">
                            {t("create_rental.deposit_note", "Monto para reservar (20%)")}
                          </span>
                        </div>
                        <span className="font-black text-2xl text-primary">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                            maximumFractionDigits: 0,
                          }).format(senaAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 5: {
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
                <h3 className="card-title">
                  {t("create_rental.summary", "Resumen del alquiler")}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">
                        {t("create_rental.dates", "Fechas")}:
                      </p>
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
                      <p className="font-semibold">
                        {t("create_rental.car", "Auto")}:
                      </p>
                      <p>{sel ? `${sel.marca} ${sel.modelo}` : "-"}</p>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold">
                        {t("create_rental.pickup_method", "Retiro")}:
                      </p>
                      <p>
                        {formData.retiroTipo === "sucursal"
                          ? t(
                              "create_rental.pickup_branch",
                              "Retiro en sucursal",
                            )
                          : formData.retiroLugar || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold">
                        {t("create_rental.driver_option", "Chofer")}:
                      </p>
                      <p>
                        {formData.requiereChofer === "si"
                          ? t("create_rental.driver_yes", "Sí, con cargo extra")
                          : t("create_rental.driver_no", "No, solo el auto")}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold">
                        {t("create_rental.client_label", "Cliente")}:
                      </p>
                      <p>
                        <span className="opacity-80">{t("create_rental.name", "Nombre")}:</span> {formData.nombre} {formData.apellido}
                      </p>
                      <p>
                        <span className="opacity-80">{t("create_rental.doc_type", "Tipo de documento")}:</span> {formData.tipo_dni === "PAS" ? t("create_rental.passport", "Pasaporte") : formData.tipo_dni} - {formData.dni}
                      </p>
                      <p>
                        {t("create_rental.nationality", "Nacionalidad")}:{" "}
                        {formData.nacionalidad}
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">
                      {t("create_rental.total", "Total")}:{" "}
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(totalAmount)}
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

  const stepItems = [
    {
      step: 1,
      label: t("create_rental.step_1", "Fechas"),
    },
    {
      step: 2,
      label: t("create_rental.step_2", "Auto"),
    },
    {
      step: 3,
      label: t("create_rental.step_3", "Retiro"),
    },
    {
      step: 4,
      label: t("create_rental.step_4", "Cliente y pago"),
    },
    {
      step: 5,
      label: t("create_rental.step_5", "Confirmación"),
    },
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="space-y-8 py-8"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-center w-full mb-8 mt-20 px-2 sm:px-0">
          <div className="w-full overflow-x-auto pb-2">
            <ul className="steps steps-horizontal w-max min-w-full lg:w-full lg:max-w-5xl mx-auto lg:justify-between">
              {stepItems.map(({ step, label }) => {
                const isActive = currentStep === step;
                const isCompleted = currentStep > step;
                const canNavigate = step < currentStep;

                return (
                  <li
                    key={step}
                    className={`step ${isActive || isCompleted ? "step-primary" : ""} text-center lg:text-left whitespace-nowrap`}
                    data-content={isCompleted ? "✓" : step}
                  >
                    {canNavigate ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(step)}
                        className={`leading-tight ${isActive ? "cursor-default" : "cursor-pointer"}`}
                        aria-label={label}
                      >
                        <span className="block text-xs sm:text-sm font-semibold text-center lg:text-left whitespace-nowrap">
                          {label}
                        </span>
                      </button>
                    ) : (
                      <span className="leading-tight">
                        <span className="block text-xs sm:text-sm font-semibold text-center lg:text-left whitespace-nowrap">
                          {label}
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

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
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="btn btn-primary"
            >
              {t("create_rental.next", "Siguiente")}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalCreate}
              className={`btn btn-success ${isLoading ? "loading" : ""}`}
            >
              {t("create_rental.confirm", "Confirmar reserva")}
            </button>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal modal-open">
          <div className="modal-box text-center relative">
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} className="text-success" />
            </div>
            <h3 className="font-bold text-2xl text-base-content mb-4">
              {t("create_rental.success_title", "¡Reserva Exitosa!")}
            </h3>
            <p className="py-2 text-lg text-base-content/80">
              {t("create_rental.email_sent_prefix", "Se ha enviado un correo a")}{" "}
              <strong className="text-primary">{formData.email}</strong>{" "}
              {t("create_rental.email_sent_suffix", "con los detalles de la reserva y un código QR.")}
            </p>

            <div className="bg-base-200 border border-base-300 p-6 rounded-xl my-6 text-left shadow-sm">
              <p className="font-semibold text-lg text-base-content mb-3">
                {t("create_rental.next_steps", "Pasos a seguir:")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-base-content/80">
                <li>{t("create_rental.check_inbox", "Revisa tu bandeja de entrada (y la carpeta de spam).")}</li>
                <li>{t("create_rental.keep_qr", "Conserva el código QR que recibiste en el correo.")}</li>
                <li>{t("create_rental.present_qr", "Presenta el código QR al momento de retirar el vehículo en nuestras oficinas.")}</li>
              </ul>
            </div>

            <div className="w-full bg-base-300 rounded-full h-1.5 mb-6 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 10) * 100}%` }}
              ></div>
            </div>

            <p className="text-sm text-base-content/60 mb-6">
              {t("create_rental.redirect_in", "Serás redirigido al inicio en")}{" "}
              <span className="font-bold">{countdown}</span>{" "}
              {t("create_rental.redirect_suffix", "segundos...")}
            </p>

            <div className="modal-action justify-center">
              <button
                type="button"
                className="btn btn-primary px-8"
                onClick={() => setLocation("/")}
              >
                {t("create_rental.go_home_now", "Ir al inicio ahora")}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
