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
      <video
        autoPlay
        muted
        loop
        className="fixed inset-0 w-full h-full object-cover -z-10"
      >
        <source
          src="/video/output.webm"
          type="video/webm"
        />
      </video>

      {showWelcome && (
        <div className="fixed inset-0 bg-gradient-to-br from-base-300 via-secondary to-base-100 z-50 items-center justify-center">
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
          <div className="flex justify-center space-x-1"></div>
        </div>
      )}

      <ParticleBackground />

      <div className="min-h-screen bg-gradient-to-br from-bg-base-100 via-bg-base-300 to-gray-900 relative z-10">
        <div ref={heroRef} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-bg-base-100 to-bg-base-200"></div>

          <div className="relative z-10 ml-40 flex flex-col justify-start pt-[55vh] pb-12 w-fit">
            
            <div className="mb-6">
              <div 
                style={{ 
                  fontFamily: "'Playfair Display', serif", 
                  fontSize: "4rem", /* Lo subí un pelín para que tenga más impacto */
                  lineHeight: "1.2"
                }}
              > 
                <h2 className="text-white drop-shadow-md">Un auto,</h2> 
                <h2 className="text-white drop-shadow-md">muchos propósitos</h2> 
              </div> 
            </div> 

            <button 
              className="outlineButton px-6 py-2 rounded-xl font-semibold w-max" 
              style={{ 
                fontFamily: "'Playfair Display', serif", 
                fontSize: "1.4rem", 
                letterSpacing: "2px" /* Le da ese toque de lujo extra */
              }} 
              onClick={() => handleAlquilaYaButton()} 
            > 
              ALQUILA YA! 
            </button> 
          </div> 
        </div>
      </div>
    </>
  );
}

export default App;
