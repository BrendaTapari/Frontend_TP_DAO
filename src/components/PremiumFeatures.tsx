import { ShieldCheck, MapPin, Bone, Baby, Clock, Map } from "lucide-react";

const features = [
  {
    icon: <Baby className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Asientos para Niños",
    description:
      "Seguridad garantizada para los más pequeños. Disponemos de huevitos (0-13kg), butacas (9-18kg) y boosters (15-36kg) instalados profesionalmente según normativa.",
    colSpan: "md:col-span-2 lg:col-span-2",
    gradient: "from-blue-900/40 via-transparent to-transparent",
  },
  {
    icon: <Bone className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Pet Friendly",
    description:
      "Tu fiel compañero viaja contigo. Incluimos cobertores de asientos premium y arneses de seguridad sin costo adicional.",
    colSpan: "md:col-span-1 lg:col-span-1",
    gradient: "from-amber-900/40 via-transparent to-transparent",
  },
  {
    icon: <Map className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Navegación GPS y Wi-Fi",
    description:
      "Rutas precisas con sistemas GPS integrados de alta gama, Apple CarPlay, Android Auto y conectividad Wi-Fi a bordo para todos los pasajeros.",
    colSpan: "md:col-span-1 lg:col-span-1",
    gradient: "from-emerald-900/40 via-transparent to-transparent",
  },
  {
    icon: <Clock className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Asistencia 24/7",
    description:
      "Soporte exclusivo en carretera a cualquier hora del día. Porque en un viaje de lujo, tu tranquilidad es nuestra absoluta prioridad.",
    colSpan: "md:col-span-2 lg:col-span-1",
    gradient: "from-purple-900/40 via-transparent to-transparent",
  },
  {
    icon: <MapPin className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Concierge Delivery",
    description:
      "Nos encargamos de llevar el vehículo directamente a la puerta de tu hotel, domicilio o recibiéndote en el aeropuerto con un trato VIP.",
    colSpan: "md:col-span-1 lg:col-span-1",
    gradient: "from-rose-900/40 via-transparent to-transparent",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Seguro Premium Todo Riesgo",
    description:
      "Nuestra tarifa incluye una cobertura total sin sorpresas. Relájate y disfruta del camino sin preocuparte por pequeños detalles.",
    colSpan: "md:col-span-2 lg:col-span-3",
    gradient: "from-slate-800/60 via-transparent to-transparent",
  },
];

export default function PremiumFeatures() {
  return (
    <section className="relative w-full py-32 bg-[#050505] flex justify-center items-center overflow-hidden">
      {/* Gradiente de transición desde la sección superior */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-base-100 to-transparent z-10 pointer-events-none"></div>

      {/* Subtle Grid Pattern para dar un toque técnico/premium */}
      <div className="absolute inset-0 z-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="premium-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#premium-grid)" />
        </svg>
      </div>

      {/* Background Orbs de Lujo (Dorado y Azul Oscuro Profundo) */}
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/15 rounded-full blur-[150px] pointer-events-none z-0 mix-blend-screen"></div>

      <div className="max-w-7xl w-full px-6 relative z-10">
        <div className="text-center mb-20">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            La Diferencia Está en los Detalles
          </h2>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto tracking-wide">
            Cada viaje incluye de forma opcional accesorios pensados para
            maximizar tu confort, seguridad y la de tu familia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`relative group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/30 cursor-pointer ${feature.colSpan}`}
            >
              {/* Hover Effect Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
              ></div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="bg-white/10 p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl text-white font-semibold mb-4 tracking-wide">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed font-light mt-auto">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
