import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAutos } from "../services/autosService";
import { useVisibleFocus } from "../hooks/useVisibleFocus";
import { useTranslation } from "react-i18next";

interface Auto {
  id: number;
  marca: string;
  modelo: string;
  año: number;
  estado: string;
  costo: number;
  periodicidad_mantenimiento: number;
  imagen: string;
  caja?: string;
  kilometraje?: string;
  cant_pasajeros?: number;
  litros_baul?: number;
}

export default function CarFleet() {
  const [, setLocation] = useLocation();
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  // Activar navegación TAB solo en elementos visibles
  useVisibleFocus(containerRef, "button, a, article, [role='listitem']");

  useEffect(() => {
    fetchAutos();
  }, []);

  const fetchAutos = async () => {
    try {
      const data = await getAutos();
      setAutos(data);
    } catch (error) {
      console.error("Error al obtener autos:", error);
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
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, auto: Auto) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setLocation(`/car-detail/${auto.id}`);
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (!autos.length) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % autos.length);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + autos.length) % autos.length);
    }
  };

  return (
    <div
      dir={i18n.dir()}
      className="min-h-screen bg-base-100 pt-20 pb-12"
      ref={containerRef}
    >
      {/* Header */}
      <header className="px-4 lg:px-12 mb-12">
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setLocation("/")}
            className="btn btn-circle btn-icon btn-outline btn-accent h-13 w-13 flex items-center gap-2 mt-6 text-gray-300 hover:text-white transition-colors mb-6 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            aria-label={t("common.back")}
          >
            {isRtl ? (
              <>
                <ArrowLeft size={28} className="font-bold" style={{ transform: "scaleX(-1)" }} />
              </>
            ) : (
              <>
                <ArrowLeft size={28} className="font-bold"/>
              </>
            )}
          </button>

          <h1
            className="text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-xl"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("fleet.title")}
          </h1>
        </div>

        <p className="text-xl text-gray-300 ">{t("fleet.description")}</p>
      </header>

      {/* Loading */}
      {loading ? (
        <div
          className="flex justify-center items-center h-96"
          role="status"
          aria-live="polite"
        >
          <div className="text-xl text-gray-400">{t("fleet.loading")}</div>
        </div>
      ) : (
        <main className="px-4 lg:px-12">
          {/* Lista de Autos */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16"
            role="list"
            ref={listRef}
            onKeyDown={handleListKeyDown}
            aria-label="Lista de vehículos disponibles"
          >
            {autos.map((auto, index) => (
              <article
                key={auto.id}
                role="listitem"
                className={`group bg-base-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 border border-gray-700/50 focus-within:shadow-2xl focus-within:shadow-primary/40 focus-within:ring-2 focus-within:ring-primary ${
                  focusedIndex === index ? "ring-2 ring-primary" : ""
                }`}
                aria-label={`${auto.marca} ${auto.modelo}, ${t("fleet.state")}: ${auto.estado.replace("_", " ")}`}
              >
                {/* Image Container */}
                <div className="relative h-56 p-16 bg-base-300 overflow-hidden flex items-center justify-center">
                  <img
                    src={auto.imagen}
                    alt={`${auto.marca} ${auto.modelo}`}
                    className=" object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {auto.marca} {auto.modelo}
                    </h3>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t("fleet.year")}
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {auto.año}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t("fleet.cost")}
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        ${auto.costo.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t("fleet.state")}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoColor(
                          auto.estado,
                        )}`}
                      >
                        {t(`fleet.status_${auto.estado}`, auto.estado.charAt(0).toUpperCase() + auto.estado.slice(1).replace("_", " "))}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t("fleet.gearbox", "Caja")}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {auto.caja ? t(`fleet.gearbox_${auto.caja.toLowerCase()}`, auto.caja) : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {t("fleet.passengers", "Pasajeros")}
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {auto.cant_pasajeros ?? "-"}
                      </p>
                    </div>

                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setLocation(`/car-detail/${auto.id}`)}
                    onKeyDown={(e) => handleKeyDown(e, auto)}
                    className="w-full btn btn-primary text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                    aria-label={`${t("fleet.view_details")} ${auto.marca} ${auto.modelo}`}
                  >
                    {t("fleet.view_details")}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Empty State */}
          {autos.length === 0 && (
            <div className="text-center py-20" role="status">
              <p className="text-2xl text-gray-400">{t("fleet.no_vehicles")}</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
