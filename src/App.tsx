import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import ParticleBackground from "./components/ParticleBackground";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import CarCarousel from "./components/CarCarousel";
import PremiumFeatures from "./components/PremiumFeatures";
import { ChevronDown } from "lucide-react";

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

  return (
    <>
      {showWelcome && (
        <div className="fixed inset-0 bg-gradient-to-br from-base-300 via-secondary to-base-100 z-50 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-3 h-3 rounded-full animate-bounce"></div>
            <div className="w-full h-72 mx-auto mt-14">
              <DotLottieReact
                src="https://lottie.host/acfe4ef8-1b28-480f-acd5-d4aad64a05e5/16Stl4t9eF.lottie"
                loop
                autoplay
              />
            </div>
            <span
              className="text-transparent bg-clip-text hover:cursor-pointer transition-all duration-700 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2.2rem",
                fontWeight: 300,
                letterSpacing: "0.25em",
                marginLeft: "0.25em",
              }}
              onClick={() => setLocation("/")}
            >
              LuxDrive
            </span>
            <p className="text-xl text-gray-300 mt-2 animate-fade-in">
              Cargando experiencia de movilidad...
            </p>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative min-h-screen w-full flex flex-col overflow-hidden snap-start">
        {/* Fondo de video absoluto solo para esta sección */}
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/Videos/output.webm" type="video/webm" />
        </video>

        <div className="absolute inset-0 z-0 pointer-events-none">
          <ParticleBackground />
        </div>

        {/* Gradiente sutil para facilitar la transición hacia la sección de abajo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-base-100 z-0 pointer-events-none"></div>

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
              <h2 className="text-white drop-shadow-md">Un auto,</h2>
              <h2 className="text-white drop-shadow-md">muchos propósitos</h2>
            </div>
          </div>

          <button
            className="outlineButton px-6 py-3 rounded-xl font-semibold w-full sm:w-max bg-black/20"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1rem, 4vw, 1.4rem)",
              letterSpacing: "2px",
            }}
            onClick={handleAlquilaYaButton}
          >
            ALQUILA YA!
          </button>
        </div>
        {showIconSroll && (
          <div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer animate-bounce"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
          >
            <div className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity">
              <span
                className="text-white mb-2 font-light tracking-wide uppercase text-sm"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Bajar
              </span>
              <ChevronDown className="w-10 h-10 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN FLOTA DE AUTOS */}
      <div className="w-full bg-base-100 py-16 px-4 sm:px-6 lg:px-12 flex flex-col justify-center relative z-10 min-h-screen snap-start">
        <div className="max-w-[90rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center h-full">
          {/* Left Column: Text & Button */}
          <div className="flex flex-col justify-center text-center lg:text-left space-y-8 sm:space-y-10 order-2 lg:order-1 mt-6 lg:mt-0 max-w-3xl mx-auto lg:mx-0">
            <div className="space-y-5 sm:space-y-6">
              <h3
                className="text-3xl sm:text-4xl lg:text-7xl font-bold text-white leading-tight drop-shadow-xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Alquila con nosotros en <br />
                <span className="text-primary italic font-light">
                  Córdoba, Argentina
                </span>
              </h3>
              <p className="text-base sm:text-lg lg:text-2xl text-gray-300 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                Descubre nuestra exclusiva selección de vehículos. Diseño,
                confort y el mejor rendimiento para que disfrutes cada kilómetro
                de tu viaje.
              </p>
            </div>

            {/* Botón Ver Flota Completa */}
            <div className="pt-4">
              <button
                className="outlineButton w-full sm:w-auto px-8 sm:px-12 py-4 rounded-full text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 hover:-translate-y-1 shadow-2xl hover:shadow-primary/30"
                style={{ fontFamily: "'Playfair Display', serif" }}
                onClick={() => setLocation("/car-fleet")}
              >
                VER FLOTA COMPLETA
              </button>
            </div>
          </div>

          {/* Right Column: Car Carousel */}
          <div className="w-full flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="w-full relative">
              {/* Optional glowing effect behind carousel */}
              <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
              <div className="relative z-10 w-full">
                <CarCarousel />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="snap-start min-h-screen">
        <PremiumFeatures />
      </div>
    </>
  );
}

export default App;
