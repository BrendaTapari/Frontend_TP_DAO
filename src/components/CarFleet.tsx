import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getAutos } from "../services/autosService";

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

export default function CarFleet() {
  const [, setLocation] = useLocation();
  const [autos, setAutos] = useState<Auto[]>([]);
  const [loading, setLoading] = useState(true);

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
      case "en_mantenimiento":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pt-20 pb-12">
      {/* Header */}
      <div className="px-4 lg:px-12 mb-12">
        <button
          onClick={() => setLocation("/")}
          className="btn  flex items-center gap-2 mt-6 text-gray-300 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Volver</span>
        </button>

        <h1
          className="text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Nuestra Flota
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl">
          Explora todos nuestros vehículos disponibles y encuentra el perfecto
          para tu viaje.
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-xl text-gray-400">Cargando flota...</div>
        </div>
      ) : (
        <div className="px-4 lg:px-12">
          {/* Grid de Autos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {autos.map((auto) => (
              <div
                key={auto.id}
                className="group bg-base-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 border border-gray-700/50"
              >
                {/* Image Container */}
                <div className="relative h-64 bg-base-300 overflow-hidden flex items-center justify-center">
                  <img
                    src={auto.imagen}
                    alt={`${auto.marca} ${auto.modelo}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {auto.marca} {auto.modelo}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Patente: {auto.patente}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Año
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {auto.año}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Costo
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        ${auto.costo.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Mantenimiento
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {auto.periodicidad_mantenimiento} meses
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Estado
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getEstadoColor(
                          auto.estado,
                        )}`}
                      >
                        {auto.estado.charAt(0).toUpperCase() +
                          auto.estado.slice(1).replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setLocation(`/car-detail/${auto.id}`)}
                    className="w-full btn  btn-primary text-white font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {autos.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-400">
                No hay autos disponibles en la flota.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-base-200 rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">
                Total de Autos
              </p>
              <p className="text-4xl font-bold text-white">{autos.length}</p>
            </div>
            <div className="bg-base-200 rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">
                Disponibles
              </p>
              <p className="text-4xl font-bold text-green-400">
                {autos.filter((a) => a.estado === "disponible").length}
              </p>
            </div>
            <div className="bg-base-200 rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">
                En Alquiler
              </p>
              <p className="text-4xl font-bold text-blue-400">
                {autos.filter((a) => a.estado === "en_alquiler").length}
              </p>
            </div>
            <div className="bg-base-200 rounded-xl p-6 border border-gray-700/50">
              <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">
                En Mantenimiento
              </p>
              <p className="text-4xl font-bold text-yellow-400">
                {autos.filter((a) => a.estado === "en_mantenimiento").length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
