import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import ParticleBackground from "./components/ParticleBackground";
import CarCarousel from "./components/CarCarousel";
import PremiumFeatures from "./components/PremiumFeatures";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

gsap.registerPlugin(MotionPathPlugin);

function App() {
  const [, setLocation] = useLocation();
  const [showIconSroll, setShowIconScroll] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    const hasShownWelcome = sessionStorage.getItem("hasShownWelcome");
    return !hasShownWelcome;
  });
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        {
          opacity: 0,
          y: -50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
        },
      );
    }

    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.children,
        {
          opacity: 0,
          y: 100,
          rotationX: -15,
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "back.out(1.7)",
        },
      );
    }

    const welcomeTimer = setTimeout(() => {
      setShowWelcome(false);
      sessionStorage.setItem("hasShownWelcome", "true");
    }, 5000);

    return () => clearTimeout(welcomeTimer);
  }, []);

  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      if (window.scrollY < 50) {
        setShowIconScroll(true);
      }
    }, 5000);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowIconScroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(scrollTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleAlquilaYaButton = () => {
    setLocation("/add-rental");
  };

  // Manejador de teclado para scroll icon
  const handleScrollIconKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  const AnimatedLogo = () => (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.img
        src="/Images/logo/logo-lux-drive.svg"
        alt="LuxDrive"
        className="h-24 w-auto sm:h-28 drop-shadow-[0_0_28px_rgba(255,255,255,0.18)] "
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.45 }}
      >
        <p
          className="text-3xl sm:text-4xl tracking-[0.28em] text-white"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 300 }}
        >
          LuxDrive
        </p>
        <p
          className="mt-1 text-[0.65rem] sm:text-xs uppercase tracking-[0.45em] text-white/50"
          style={{ fontFamily: "'Josefin Sans', sans-serif", fontWeight: 200 }}
        >
          Movilidad de élite
        </p>
      </motion.div>
    </motion.div>
  );

  const ProgressBar = () => (
    <div className="w-56 h-px bg-primary/10 relative overflow-hidden mt-2">
      <motion.div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-primary to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
  return (
    <>
      {showWelcome && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-10"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: { duration: 0.8, ease: "easeInOut" },
            }}
            role="status"
            aria-live="polite"
            aria-label="Pantalla de bienvenida de carga"
          >
            {/* Grid decorativo de fondo */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 0.5px, transparent 0.5px)",
                backgroundSize: "60px 60px",
              }}
            />

            {/* Orbe de luz central */}
            <motion.div
              className="absolute w-72 h-72 rounded-full bg-primary/5"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Esquinas decorativas */}
            {[
              "top-5 left-5 border-t border-l",
              "top-5 right-5 border-t border-r",
              "bottom-5 left-5 border-b border-l",
              "bottom-5 right-5 border-b border-r",
            ].map((cls, i) => (
              <motion.div
                key={i}
                className={`absolute w-6 h-6 border-primary/25 ${cls}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 0.6 }}
              />
            ))}

            {/* Logo animado */}
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <AnimatedLogo />
            </motion.div>

            {/* Divisor con diamante */}
            <motion.div
              className="relative z-10 flex items-center gap-3 w-56"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
              <div className="w-1.5 h-1.5 bg-primary/60 rotate-45 shrink-0" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
            </motion.div>

            {/* Progress bar + texto */}
            <motion.div
              className="relative z-10 flex flex-col items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.6 }}
            >
              <ProgressBar />
              <p
                className="text-primary/40 uppercase tracking-[0.45em] text-[0.6rem] ml-1"
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontWeight: 200,
                }}
              >
                Preparando su experiencia
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* HERO SECTION */}
      <header
        className="relative min-h-screen w-full flex flex-col overflow-hidden snap-start"
        role="banner"
      >
        {/* Fondo de video absoluto solo para esta sección */}
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover z-0"
          aria-hidden="true"
        >
          <source src="/Videos/output.webm" type="video/webm" />
        </video>

        <div
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <ParticleBackground />
        </div>

        {/* Gradiente sutil para facilitar la transición hacia la sección de abajo */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-base-100 z-0 pointer-events-none"
          aria-hidden="true"
        ></div>

        <div
          ref={heroRef}
          className="relative z-10 w-full max-w-4xl px-6 sm:px-10 flex flex-col justify-start pt-[48vh] sm:pt-[52vh] lg:pt-[55vh] pb-2 mx-auto lg:mx-0 lg:ml-20"
        >
          <div className="mb-6 text-center lg:text-left">
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.5rem, 8vw, 4rem)",
                lineHeight: "1.2",
              }}
            >
              <h1 className="text-white drop-shadow-md">Un auto,</h1>
              <h1 className="text-white drop-shadow-md">muchos propósitos</h1>
            </div>
          </div>

          <button
            className="outlineButton px-6 py-3 rounded-xl font-semibold w-full sm:w-max bg-black/20 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1rem, 4vw, 1.4rem)",
              letterSpacing: "2px",
            }}
            onClick={handleAlquilaYaButton}
            aria-label="Alquilar un vehículo ahora"
          >
            ALQUILA YA!
          </button>
        </div>
        {showIconSroll && (
          <button
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 animate-bounce focus:outline-2 focus:outline-offset-2 focus:outline-primary rounded-lg"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
            onKeyDown={handleScrollIconKeyDown}
            aria-label="Desplazarse hacia abajo para ver más contenido"
          >
            <div className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity p-2">
              <span
                className="text-white mb-2 font-light tracking-wide uppercase text-sm"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Bajar
              </span>
              <ChevronDown className="w-10 h-10 text-white" />
            </div>
          </button>
        )}
      </header>

      {/* SECCIÓN FLOTA DE AUTOS */}
      <section
        className="w-full bg-base-100 py-16 px-4 sm:px-6 lg:px-12 flex flex-col justify-center relative z-10 min-h-screen snap-start"
        aria-labelledby="fleet-heading"
      >
        <div className="max-w-[90rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center h-full">
          {/* Left Column: Text & Button */}
          <div className="flex flex-col justify-center text-center lg:text-left space-y-8 sm:space-y-10 order-2 lg:order-1 mt-6 lg:mt-0 max-w-3xl mx-auto lg:mx-0">
            <div className="space-y-5 sm:space-y-6">
              <h2
                id="fleet-heading"
                className="text-3xl sm:text-4xl lg:text-7xl font-bold text-white leading-tight drop-shadow-xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Alquila con nosotros en <br />
                <span className="text-primary italic font-light">
                  Córdoba, Argentina
                </span>
              </h2>
              <p className="text-base sm:text-lg lg:text-2xl text-gray-300 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                Descubre nuestra exclusiva selección de vehículos. Diseño,
                confort y el mejor rendimiento para que disfrutes cada kilómetro
                de tu viaje.
              </p>
            </div>

            {/* Botón Ver Flota Completa */}
            <div className="pt-4">
              <button
                className="outlineButton w-full sm:w-auto px-8 sm:px-12 py-4 rounded-full text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 hover:-translate-y-1 shadow-2xl hover:shadow-primary/30 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                style={{ fontFamily: "'Playfair Display', serif" }}
                onClick={() => setLocation("/car-fleet")}
                aria-label="Ver flota completa de vehículos"
              >
                VER FLOTA COMPLETA
              </button>
            </div>
          </div>

          {/* Right Column: Car Carousel */}
          <div className="w-full flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="w-full relative">
              {/* Optional glowing effect behind carousel */}
              <div
                className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none"
                aria-hidden="true"
              ></div>
              <div className="relative z-10 w-full">
                <CarCarousel />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="snap-start min-h-screen"
        aria-label="Características Premium"
      >
        <PremiumFeatures />
      </section>
    </>
  );
}

export default App;
