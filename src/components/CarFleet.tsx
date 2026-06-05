import { useLocation } from "wouter";
import { ArrowLeft, Users, Briefcase, Settings2, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getAutos } from "../services/autosService";
import { useTranslation } from "react-i18next";
import { useVisibleFocus } from "../hooks/useVisibleFocus";

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
  const [focusedIndex, setFocusedIndex] = useState(-1);
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

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev === -1 ? 0 : (prev + 1) % autos.length));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) =>
        prev === -1
          ? autos.length - 1
          : (prev - 1 + autos.length) % autos.length,
      );
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
                <ArrowLeft
                  size={28}
                  className="font-bold"
                  style={{ transform: "scaleX(-1)" }}
                />
              </>
            ) : (
              <>
                <ArrowLeft size={28} className="font-bold" />
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
        <main className="px-4 lg:px-12 max-w-[1600px] mx-auto">
          {/* Lista de Autos */}
          <div
            className="flex flex-col gap-4 max-w-5xl mx-auto"
            role="list"
            ref={listRef}
            onKeyDown={handleListKeyDown}
            aria-label="Lista de vehículos disponibles"
          >
            {autos.map((auto, index) => (
              <article
                key={auto.id}
                role="listitem"
                className={`group bg-base-200/40 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-white/5 p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 md:gap-8 focus-within:ring-2 focus-within:ring-primary ${
                  focusedIndex === index ? "ring-2 ring-primary" : ""
                }`}
                aria-label={`${auto.marca} ${auto.modelo}, ${t("fleet.state")}: ${auto.estado.replace("_", " ")}`}
              >
                {/* Image */}
                <div className="w-full md:w-64 aspect-[16/9] flex-shrink-0 overflow-hidden rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <img
                    src={auto.imagen}
                    alt={`${auto.marca} ${auto.modelo}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Info (Title, Subtitle, Features) */}
                <div className="flex-1 w-full flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-bold text-white">
                      {auto.marca} {auto.modelo}
                    </h3>
                    <Info
                      size={16}
                      className="text-gray-500 cursor-pointer hover:text-white transition-colors"
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    {auto.marca} {auto.modelo} ({auto.año}){" "}
                    {t("fleet.or_similar", "o similar")}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-3 text-sm text-gray-300">
                    <div
                      className="flex items-center gap-2"
                      title={t("fleet.gearbox", "Caja")}
                    >
                      <Settings2 size={16} className="text-gray-500" />
                      <span>
                        {auto.caja
                          ? t(
                              `fleet.gearbox_${auto.caja.toLowerCase()}`,
                              auto.caja,
                            )
                          : "-"}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-2"
                      title={t("fleet.passengers", "Pasajeros")}
                    >
                      <Users size={16} className="text-gray-500" />
                      <span>
                        {auto.cant_pasajeros} {t("fleet.people", "pasajeros")}
                      </span>
                    </div>
                    {auto.litros_baul && (
                      <div
                        className="flex items-center gap-2"
                        title={t("fleet.trunk", "Baúl")}
                      >
                        <Briefcase size={16} className="text-gray-500" />
                        <span>{auto.litros_baul} L</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price and Action */}
                <div className="w-full md:w-auto flex flex-col sm:flex-row items-center md:justify-end gap-6 md:gap-10 md:ps-8 md:border-s border-white/10">
                  {/* Prices & Status */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 md:gap-8">
                    <div className="flex flex-col items-start sm:items-end md:items-center">
                      <span className="text-xl md:text-2xl font-bold text-white">
                        ${auto.costo.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t("fleet.per_day", "Por día")}
                      </span>
                    </div>
                    <div className="w-[1px] h-10 bg-white/10 hidden sm:block"></div>
                    <div className="flex flex-col items-end sm:items-start md:items-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-semibold border ${getEstadoColor(auto.estado)}`}
                      >
                        {t(
                          `fleet.status_${auto.estado}`,
                          auto.estado.replace("_", " "),
                        )}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">
                        {t("fleet.state", "Estado")}
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => setLocation(`/car-detail/${auto.id}`)}
                    onKeyDown={(e) => handleKeyDown(e, auto)}
                    className="w-full sm:w-auto btn btn-primary btn-outline font-semibold rounded-lg px-8 hover:opacity-90"
                    aria-label={`${t("fleet.select")} ${auto.marca} ${auto.modelo}`}
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
