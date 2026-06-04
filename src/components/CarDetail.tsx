import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { getCarByPatente } from "../services/autosService";
import mockCars from "../data/mockCars.json";
import { useTranslation } from "react-i18next";

interface Auto {
  id: number;
  patente: string;
  marca: string;
  modelo: string;
  año: number;
  estado: string;
  costo: number;
  periodicidad_mantenimiento: number;
  imagen: string;
}

export default function CarDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/car-detail/:id");
  const [auto, setAuto] = useState<Auto | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (params?.id) {
      fetchCar(params.id);
    }
  }, [params?.id]);

  const fetchCar = async (id: string) => {
    try {
      const carId = parseInt(id);
      const car = mockCars.find((c) => c.id === carId);
      setAuto(car || null);
    } catch (error) {
      console.error("Error al obtener auto:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "en_alquiler":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "en_mantenimiento":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 pt-20 flex items-center justify-center">
        <div className="text-xl text-gray-400">
          {t("fleet.loading_details", "Cargando detalles del vehículo...")}
        </div>
      </div>
    );
  }

  if (!auto) {
    return (
      <div className="min-h-screen bg-base-100 pt-20 flex flex-col items-center justify-center">
        <p className="text-2xl text-gray-400 mb-6">{t("fleet.car_not_found", "Vehículo no encontrado")}</p>
        <button
          onClick={() => setLocation("/car-fleet")}
          className="flex items-center gap-2 text-primary hover:text-accent transition-colors"
        >
          <ArrowLeft size={20} />
          <span>{t("fleet.back_to_fleet", "Volver a la flota")}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 pt-20 pb-12">
      {/* Header */}
      <div className="px-4 lg:px-12 mb-8">
        <button
          onClick={() => setLocation("/")}
          className="flex btn btn-outline items-center gap-2 mt-10 text-gray-300 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>{t("fleet.back_to_home", "Volver al inicio")}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Imagen grande del vehículo */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full bg-base-200 rounded-2xl p-8 flex items-center justify-center min-h-[500px] border border-gray-700/50">
              <img
                src={auto.imagen}
                alt={`${auto.marca} ${auto.modelo}`}
                className="max-w-full max-h-96 object-contain"
              />
            </div>
            <div className="mt-6 flex gap-4 w-full">
              {auto.estado === "disponible" && (
                <button className="flex-1 bg-gradient-to-r from-primary to-accent text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">
                  {t("fleet.rent_now", "Alquilar Ahora")}
                </button>
              )}
              {auto.estado !== "disponible" && (
                <button
                  disabled
                  className="flex-1 bg-gray-600 text-gray-300 font-semibold py-3 rounded-lg cursor-not-allowed opacity-50"
                >
                  {t("fleet.not_available", "No disponible")}
                </button>
              )}
            </div>
          </div>

          {/* Información del vehículo */}
          <div className="flex flex-col justify-start">
            {/* Título */}
            <div className="mb-8">
              <h1
                className="text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {auto.marca}
              </h1>
              <h2 className="text-3xl lg:text-4xl text-gray-300 mb-4">
                {auto.modelo}
              </h2>
              <div className="h-[2px] w-20 bg-gradient-to-r from-primary to-accent mb-6"></div>
            </div>

            {/* Estado */}
            <div className="mb-8">
              <p className="text-gray-500 text-sm uppercase tracking-widest mb-2">
                {t("fleet.state", "Estado")}
              </p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getEstadoColor(
                  auto.estado,
                )}`}
              >
                {t(`fleet.status_${auto.estado}`, auto.estado.charAt(0).toUpperCase() + auto.estado.slice(1).replace("_", " "))}
              </span>
            </div>

            {/* Grid de especificaciones */}
            <div className="grid grid-cols-2 gap-6 mb-8">
            
              <div className="bg-base-200 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">
                  {t("fleet.year", "Año")}
                </p>
                <p className="text-2xl font-bold text-white">{auto.año}</p>
              </div>
              <div className="bg-base-200 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">
                  {t("fleet.daily_cost", "Costo Diario")}
                </p>
                <p className="text-2xl font-bold text-primary">
                  ${auto.costo.toLocaleString()}
                </p>
              </div>
              <div className="bg-base-200 rounded-lg p-4 border border-gray-700/50">
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">
                  {t("fleet.maintenance_period", "Mantenimiento")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {auto.periodicidad_mantenimiento} {t("fleet.months", "meses")}
                </p>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-base-200 rounded-lg p-6 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-3">{t("fleet.description_title", "Descripción")}</h3>
              <p className="text-gray-300 leading-relaxed">
                {t("fleet.description_text", "Vehículo {{marca}} {{modelo}} del año {{year}}. Patente {{plate}}. Perfecto para tus viajes alrededor de Córdoba. Disfruta de confort y seguridad en cada kilómetro.", { marca: auto.marca, modelo: auto.modelo, year: auto.año, plate: auto.patente })}
              </p>
            </div>

            {/* Contacto */}
            <div className="mt-8 pt-8 border-t border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-4">
                {t("fleet.questions", "¿Preguntas sobre este vehículo?")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors cursor-pointer">
                  <Phone size={20} />
                  <span>+54 (351) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300 hover:text-primary transition-colors cursor-pointer">
                  <Mail size={20} />
                  <span>info@luxdrive .com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin size={20} />
                  <span>Córdoba, Argentina</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
