import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import mockCars from "../data/mockCars.json";
import { useTranslation } from "react-i18next";

interface Auto {
  id: number;
  patente?: string;
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
  const [, params] = useRoute("/car-detail/:id");
  const [auto, setAuto] = useState<Auto | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();

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

  const handleBtnAlquilar = () => {
    if (auto?.estado === 'disponible') {
      setLocation(`/add-rental`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pt-20 flex items-center justify-center">
        <div className="text-xl text-gray-500 uppercase tracking-widest animate-pulse">
          {t("fleet.loading_details", "Cargando detalles...")}
        </div>
      </div>
    );
  }

  if (!auto) {
    return (
      <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#0a0a0a] pt-20 flex flex-col items-center justify-center">
        <p className="text-2xl text-gray-500 mb-6 uppercase tracking-widest">{t("fleet.car_not_found", "Vehículo no encontrado")}</p>
        <button
          onClick={() => setLocation("/car-fleet")}
          className="flex items-center gap-3 text-white/70 hover:text-white transition-colors  uppercase tracking-widest text-sm"
        >
          <ArrowLeft size={20} className="rtl:rotate-180" />
          <span>{t("fleet.back_to_fleet", "Volver a la flota")}</span>
        </button>
      </div>
    );
  }

  return (
    <div dir={i18n.language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative selection:bg-red-500/30 font-sans">
      {/* Background Glow */}
      <div className="absolute bottom-0 start-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] -translate-x-1/3 rtl:translate-x-1/3 translate-y-1/3 pointer-events-none"></div>



      <div className="relative z-10 max-w-[1600px] mx-auto md:mt-20 px-6 md:px-12 pt-4">
        {/* Header Section: Title & Price */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 gap-8">
          {/* Title */}
          <div className="flex items-baseline flex-wrap gap-x-4 gap-y-2">
            <div>
              <div className="flex items-baseline gap-x-4 mt-20 items-center gap-y-2">
              <button
                onClick={() => setLocation("/car-fleet")}
                data-tip={t("fleet.back_to_fleet", "Volver a la flota")}
                className="flex btn btn-circle border border-white/10 bg-black/20 tooltip tooltip-left  rtl:tooltip-left text-zinc-100 shadow-lg backdrop-blur-sm hover:border-white/20 hover:bg-white/10 items-center gap-3 text-white/50 hover:text-white transition-colors"
              >
                <ArrowRight size={28} style={{ transform: "scaleX(-1)" }}   className="rtl:rotate-180 font-bold" />
              </button>

            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-none">
              {auto.marca}
            </h1>
              <h2 
                className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-tighter leading-none text-transparent" 
                style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.6)' }}
                >
                {auto.modelo}
              </h2>
                </div>
          </div>
            
          </div>
          
          {/* Price & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
             <div className="text-start sm:text-end">
               <div className="flex items-start justify-start sm:justify-end">
                 <span className="text-xl mt-1.5 me-1 text-gray-400 font-light">$</span>
                 <span className="text-4xl md:text-5xl font-semibold tracking-tight">{auto.costo.toLocaleString()}</span>
               </div>
               <p className="text-sm text-gray-300 mt-1 tracking-widest">{t("fleet.daily_cost_inclusive", "Costo diario. Impuestos incluidos.")}</p>
             
             </div>
          </div>
        </div>

        {/* Car Image Area */}
        <div className="relative w-full h-[35vh] md:h-[45vh] lg:h-[55vh] flex items-center justify-center mt-16 md:mt-15 mb-5 md:mb-15 group">
            <img 
              src={auto.imagen} 
              alt={`${auto.marca} ${auto.modelo}`}
              className="relative z-10 w-full max-w-[1100px] h-full object-contain drop-shadow-2xl scale-110 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Reflection */}
            <div className="absolute top-[70%] start-0 w-full h-full flex justify-center opacity-50 pointer-events-none">
              <img 
                src={auto.imagen} 
                alt="Reflection"
                className="w-full max-w-[1100px] h-full object-contain scale-y-[-1]"
                style={{ 
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 40%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, transparent 40%)' 
                }}
              />
            </div>
        </div>

        {/* Bottom Section */}
        <div className="w-full flex justify-end">
          <button 
                className="border btn btn-outline btn-lg btn-primary mt-4 md:mb-0 mb-4 border-white/30 px-8 py-3 transition-all duration-300 tracking-widest text-xs uppercase font-medium disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-white disabled:cursor-not-allowed"
                disabled={auto.estado !== 'disponible'}
               onClick={handleBtnAlquilar}
             >
               {auto.estado === 'disponible' ? t("fleet.rent_now", "Contact Seller") : t("fleet.not_available", "No disponible")}
             </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center pb-12 gap-12 relative z-10 w-full">
          <div className="w-full lg:max-w-xl">
            <h3 className="text-2xl md:text-3xl font-light tracking-tight mb-4 leading-tight">
              {t("fleet.extreme_performance", "Una familia de vehículos de rendimiento extremo")}
            </h3>
            <p className="text-gray-400 font-light mb-8 lg:mb-0 line-clamp-2 md:line-clamp-none">
              {t("fleet.description_text", "Vehículo {{marca}} {{modelo}} del año {{year}}. Patente {{plate}}. Perfecto para tus viajes. Disfruta de confort y seguridad en cada kilómetro.", { marca: auto.marca, modelo: auto.modelo, year: auto.año, plate: auto.patente })}
            </p>  
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center lg:justify-end gap-12 w-full">
             <div className="flex gap-10 text-sm text-gray-500 uppercase tracking-widest font-light">
                <div>
                  <span className="block text-white font-medium text-lg capitalize mb-1">{t(`fleet.status_${auto.estado}`, auto.estado.replace("_", " "))}</span>
                  {t("fleet.state", "Estado")}
                </div>
                <div>
                  <span className="block text-white font-medium text-lg mb-1">{auto.periodicidad_mantenimiento} {t("fleet.months", "meses")}</span>
                  {t("fleet.maintenance_period", "Mantenimiento")}
                </div>
            </div>

             <div className="flex items-center gap-4 text-white/50 mt-8 lg:mt-0 w-full lg:w-auto">
               <span className="text-sm font-medium">01</span>
               <div className="w-full lg:w-48 h-[1px] bg-white/20">
                 <div className="w-1/3 h-full bg-white"></div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Floating Side Elements (Social / Info) */}
      <div className="hidden xl:flex absolute end-12 top-1/2 -translate-y-1/2 flex-col gap-6 text-white/40 z-20">
         <a href="mailto:luxdrive.cor@gmail.com" className="hover:text-white transition-colors p-2"><Mail size={18}/></a>
         <a href="tel:+543511234567" className="hover:text-white transition-colors p-2"><Phone size={18}/></a>
         <div className="hover:text-white transition-colors p-2 cursor-pointer" title={t("fleet.location", "Córdoba, Argentina")}><MapPin size={18}/></div>
         
         <div className="mt-8 flex flex-col items-center gap-4 text-xs tracking-widest" style={{ writingMode: 'vertical-rl' }}>
            
            <div className="w-[1px] h-12 bg-white/30"></div>
         </div>
      </div>
    </div>
  );
}
