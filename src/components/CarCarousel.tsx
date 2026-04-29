import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import mockCars from "../data/mockCars.json";

// Transformar mockCars al formato del carrusel
const cars = mockCars.map((car) => ({
  id: car.id,
  name: `${car.marca} ${car.modelo}`,
  type: `${car.año} - ${car.estado}`,
  image: car.imagen,
}));

export default function CarCarousel() {
  const [, setLocation] = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const updateIsMobile = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const nextCar = () => {
    setActiveIndex((prev) => (prev + 1) % cars.length);
  };

  const prevCar = () => {
    setActiveIndex((prev) => (prev - 1 + cars.length) % cars.length);
  };

  const goToCar = (index: number) => {
    setActiveIndex(index);
  };

  const handleCarClick = () => {
    const selectedCar = mockCars[activeIndex];
    setLocation(`/car-detail/${selectedCar.id}`);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[420px] sm:h-[520px] lg:h-[600px] flex flex-col items-center justify-center overflow-hidden">
      {/* Carousel Container */}
      <div className="relative w-full h-[280px] sm:h-[360px] lg:h-[400px] flex items-center justify-center">
        {cars.map((car, index) => {
          // Calculate distance from active index (-1, 0, 1) handling the wrap around
          let distance = index - activeIndex;
          if (distance > cars.length / 2) distance -= cars.length;
          if (distance < -cars.length / 2) distance += cars.length;

          // Determine positions and styles based on distance
          const isActive = distance === 0;
          const isLeft = distance === -1 || (distance < 0 && !isActive);
          const isRight = distance === 1 || (distance > 0 && !isActive);
          const shouldShow = !isMobile || isActive;

          let translateX = "0%";
          let scale = 1;
          let opacity = 1;
          let zIndex = 30;
          let blur = "blur-none";

          if (isMobile) {
            translateX = "0%";
            scale = isActive ? 1 : 0.85;
            opacity = isActive ? 1 : 0;
            zIndex = isActive ? 40 : 10;
            blur = isActive ? "blur-none" : "blur-sm";
          } else if (isActive) {
            translateX = "0%";
            scale = 1.2;
            opacity = 1;
            zIndex = 40;
            blur = "blur-none";
          } else if (isLeft) {
            translateX = "-60%";
            scale = 0.7;
            opacity = 0.4;
            zIndex = 20;
            blur = "blur-sm";
          } else if (isRight) {
            translateX = "60%";
            scale = 0.7;
            opacity = 0.4;
            zIndex = 20;
            blur = "blur-sm";
          } else {
            // Hidden cars in the back
            translateX = "0%";
            scale = 0.5;
            opacity = 0;
            zIndex = 10;
            blur = "blur-md";
          }

          return (
            <div
              key={car.id}
              onClick={() => {
                if (isActive) {
                  handleCarClick();
                } else {
                  goToCar(index);
                }
              }}
              className={`absolute transition-all duration-700 ease-out cursor-pointer flex flex-col items-center justify-center ${blur} ${shouldShow ? "pointer-events-auto" : "pointer-events-none"}`}
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
              }}
            >
              <img
                src={car.image}
                alt={car.name}
                className="w-[240px] sm:w-[320px] lg:w-[400px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                style={{
                  // A slight reflection effect for luxury feel
                  WebkitBoxReflect: isActive
                    ? "below 0px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.15))"
                    : "none",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation & Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-2 sm:px-6 lg:px-10 z-50 pointer-events-none">
        <button
          onClick={prevCar}
          className="pointer-events-auto rounded-full p-2 sm:p-3 bg-white/5 border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md text-white hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 sm:w-6 sm:h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <button
          onClick={nextCar}
          className="pointer-events-auto rounded-full p-2 sm:p-3 bg-white/5 border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md text-white hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 sm:w-6 sm:h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      {/* Car Info Display */}
      <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center min-h-[88px] transition-all duration-700 px-4 text-center">
        <h4 className="text-xl sm:text-2xl lg:text-3xl font-light text-white tracking-[0.2em] sm:tracking-widest uppercase transition-all duration-500 pb-2">
          {cars[activeIndex].name}
        </h4>
        <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent my-1"></div>
        <button
          onClick={handleCarClick}
          className="inline-block px-5 sm:px-6 py-2 border border-primary/30 rounded-full text-primary text-sm sm:text-base mt-2 font-semibold hover:bg-primary/10 transition-all cursor-pointer"
        >
          Ver Detalles
        </button>
      </div>

      {/* Indicators */}
      <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
        {cars.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToCar(idx)}
            className={`transition-all duration-500 rounded-full ${
              idx === activeIndex
                ? "w-6 sm:w-8 h-1.5 bg-white"
                : "w-2 h-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
