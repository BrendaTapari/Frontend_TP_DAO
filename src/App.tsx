import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import ParticleBackground from "./components/ParticleBackground";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

gsap.registerPlugin(MotionPathPlugin);

function App() {
  const [, setLocation] = useLocation();
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
            <h1 className="text-6xl font-bold -mt-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Polymorph-Rides
            </h1>
            <p className="text-xl text-gray-300 mt-2 animate-fade-in">
              Cargando experiencia de movilidad...
            </p>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
        {/* Fondo de video absoluto solo para esta sección */}
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/video/output.webm" type="video/webm" />
        </video>

        <div className="absolute inset-0 z-0 pointer-events-none">
          <ParticleBackground />
        </div>

        {/* Gradiente sutil para facilitar la transición hacia la sección de abajo */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-base-100 z-0 pointer-events-none"></div>

        <div ref={heroRef} className="relative z-10 ml-40 flex flex-col justify-start pt-[55vh] pb-12 w-fit">
          <div className="mb-6">
            <div 
              style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontSize: "4rem",
                lineHeight: "1.2"
              }}
            > 
              <h2 className="text-white drop-shadow-md">Un auto,</h2> 
              <h2 className="text-white drop-shadow-md">muchos propósitos</h2> 
            </div> 
          </div> 

          <button 
            className="outlineButton px-6 py-2 rounded-xl font-semibold w-max bg-black/20" 
            style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: "1.4rem", 
              letterSpacing: "2px" 
            }} 
            onClick={() => handleAlquilaYaButton()} 
          > 
            ALQUILA YA! 
          </button> 
        </div>
      </div>

      {/* SECCIÓN FLOTA DE AUTOS */}
      <div className="w-full bg-base-100 py-32 flex flex-col items-center justify-start relative z-10 min-h-screen">
        <h3 className="text-4xl font-bold text-white">Nuestra flota de autos</h3>
        <p className="text-xl text-gray-300 mt-4">Descubre nuestra amplia gama de vehículos disponibles para alquilar</p>
      </div>
    </>
  );
}

export default App;
