import { useState } from "react";

const cars = [
  {
    id: 1,
    name: "Audi A3",
    type: "Premium Sedan",
    image: "/Images/audiA3.png",
  },
  {
    id: 2,
    name: "Toyota Corolla",
    type: "Hybrid Sedan",
    image: "/Images/corolla.png",
  },
  {
    id: 3,
    name: "Toyota RAV4",
    type: "Premium SUV",
    image: "/Images/Rav4.png",
  },
  {
    id: 4,
    name: "Toyota Yaris Cross",
    type: "Compact SUV",
    image: "/Images/YarisCross.png",
  },
];

export default function CarCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextCar = () => {
    setActiveIndex((prev) => (prev + 1) % cars.length);
  };

  const prevCar = () => {
    setActiveIndex((prev) => (prev - 1 + cars.length) % cars.length);
  };

  const goToCar = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[600px] flex flex-col items-center justify-center overflow-hidden">
      {/* Carousel Container */}
      <div className="relative w-full h-[400px] flex items-center justify-center">
        {cars.map((car, index) => {
          // Calculate distance from active index (-1, 0, 1) handling the wrap around
          let distance = index - activeIndex;
          if (distance > cars.length / 2) distance -= cars.length;
          if (distance < -cars.length / 2) distance += cars.length;

          // Determine positions and styles based on distance
          const isActive = distance === 0;
          const isLeft = distance === -1 || (distance < 0 && !isActive);
          const isRight = distance === 1 || (distance > 0 && !isActive);

          let translateX = "0%";
          let scale = 1;
          let opacity = 1;
          let zIndex = 30;
          let blur = "blur-none";

          if (isActive) {
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
              onClick={() => goToCar(index)}
              className={`absolute transition-all duration-700 ease-out cursor-pointer flex flex-col items-center justify-center ${blur}`}
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
              }}
            >
              <img
                src={car.image}
                alt={car.name}
                className="w-[400px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
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
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-10 z-50 pointer-events-none">
        <button
          onClick={prevCar}
          className="pointer-events-auto rounded-full p-3 bg-white/5 border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md text-white hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <button
          onClick={nextCar}
          className="pointer-events-auto rounded-full p-3 bg-white/5 border border-white/10 hover:bg-white/20 transition-all backdrop-blur-md text-white hover:scale-110"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Car Info Display */}
      <div className="mt-8 flex flex-col items-center justify-center min-h-[100px] transition-all duration-700">
        <h4 className="text-3xl font-light text-white tracking-widest uppercase transition-all duration-500 pb-2">
          {cars[activeIndex].name}
        </h4>
        <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent my-1"></div>
        <p className="text-gray-400 font-serif italic text-lg tracking-wide">
          {cars[activeIndex].type}
        </p>
      </div>
      
      {/* Indicators */}
      <div className="flex gap-3 mt-6">
        {cars.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToCar(idx)}
            className={`transition-all duration-500 rounded-full ${
              idx === activeIndex
                ? "w-8 h-1.5 bg-white"
                : "w-2 h-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
