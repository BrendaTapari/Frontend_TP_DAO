import {
  MapPin,
  Bone,
  Baby,
  Clock,
  Zap,
  Shield,
  Wifi,
} from "lucide-react";

const detailImages = [
  {
    src: "/Images/landing/niños_en_auto.jpg",
    alt: "Seguridad para Niños",
    position: "left",
  },
  {
    src: "/Images/landing/gps.jpg",
    alt: "Sistema GPS Integrado",
    position: "right",
  },
  {
    src: "/Images/landing/autos_discapacitados.jpg",
    alt: "Accesibilidad para Todos",
    position: "left",
  },
];

const luxuryFeatures = [
  {
    title: "Seguridad para Niños",
    subtitle: "Protección Máxima",
    description:
      "Sistemas de retención infantil certificados para todas las edades. Asientos de seguridad premium con protección lateral reforzada. Instalación profesional conforme a normativas internacionales de seguridad.",
    icon: <Baby className="w-12 h-12" />,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Navegación Inteligente",
    subtitle: "Tecnología GPS Avanzada",
    description:
      "Sistema GPS de última generación con mapas en tiempo real. Pantalla táctil integrada con Apple CarPlay y Android Auto. Conectividad total para una navegación sin interrupciones durante todo tu viaje.",
    icon: <Wifi className="w-12 h-12" />,
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Accesibilidad Total",
    subtitle: "Para Todos los Viajeros",
    description:
      "Vehículos adaptados con rampas de acceso y sistemas de elevación. Espacios amplios y cómodos para personas con movilidad reducida. Equipamiento especial diseñado para garantizar inclusión y comodidad.",
    icon: <Zap className="w-12 h-12" />,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
];

const premiumServices = [
  {
    icon: <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Seguro Premium Todo Riesgo",
    description: "Cobertura total sin sorpresas. Asistencia en carretera 24/7.",
  },
  {
    icon: <MapPin className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Concierge Delivery",
    description:
      "Entrega directa a tu hotel, domicilio o aeropuerto con trato VIP.",
  },
  {
    icon: <Clock className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Asistencia 24/7",
    description: "Soporte exclusivo en carretera a cualquier hora del día.",
  },
  {
    icon: <Bone className="w-8 h-8 text-white" strokeWidth={1.5} />,
    title: "Pet Friendly",
    description: "Tu fiel compañero viaja contigo con todas las comodidades.",
  },
];

export default function PremiumFeatures() {
  return (
    <section className="relative w-full py-20 sm:py-28 lg:py-32 bg-gradient-to-b from-[#050505] to-black overflow-hidden snap-start">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      {/* Transition from previous section */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-base-100 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-20 lg:mb-24">
          <h2
            className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-5 sm:mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            La Diferencia Está en los Detalles
          </h2>
          <div className="h-1 w-20 sm:w-24 bg-gradient-to-r from-primary via-primary/20  to-primary mx-auto mb-6 sm:mb-8"></div>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto px-2 sm:px-0">
            Cada experiencia es cuidadosamente diseñada para superar tus
            expectativas
          </p>
        </div>

        {/* Luxury Features with Images */}
        <div className="space-y-16 sm:space-y-20 lg:space-y-24">
          {luxuryFeatures.map((feature, index) => (
            <div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? "lg:grid-cols-2 lg:direction-rtl" : ""}`}
            >
              {/* Text Content */}
              <div
                className={`${index % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}
              >
                <div className="space-y-5 sm:space-y-6 text-center lg:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <div
                      className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient}`}
                    >
                      <div className="text-primary flex items-center justify-center">{feature.icon}</div>
                    </div>
                    <div>
                      <p className="text-primary text-sm uppercase tracking-widest font-semibold">
                        {feature.subtitle}
                      </p>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                        {feature.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                    {feature.description}
                  </p>

                  
                </div>
              </div>

              {/* Image */}
              <div
                className={`${index % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}
              >
                <div className="relative group">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                  ></div>
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 group-hover:border-white/20 transition-all duration-500">
                    <img
                      src={detailImages[index]?.src}
                      alt={detailImages[index]?.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/60 transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Services Grid */}
        <div className="mt-20 sm:mt-28 lg:mt-32 pt-16 sm:pt-20 lg:pt-24 border-t border-white/10">
          <h3
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-10 sm:mb-14 lg:mb-16 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Servicios Premium Incluidos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {premiumServices.map((service, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-sm p-6 sm:p-8 transition-all duration-500 hover:border-primary/50"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="mb-4 p-3 w-fit rounded-lg bg-primary/10 mx-auto lg:mx-0">
                    {service.icon}
                  </div>

                  <h4 className="text-lg font-bold text-white mb-3 text-center lg:text-left">
                    {service.title}
                  </h4>

                  <p className="text-gray-400 text-sm leading-relaxed font-light text-center lg:text-left">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-20 lg:mt-24 text-center">
          <p className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 px-4">
            Vive la experiencia de lujo que mereces
          </p>
          <button className="px-8 sm:px-12 py-4 btn btn-outline btn-primary text-white font-bold rounded-full text-base sm:text-lg w-full sm:w-auto max-w-sm">
            Reserva Ahora
          </button>
        </div>
      </div>
    </section>
  );
}
