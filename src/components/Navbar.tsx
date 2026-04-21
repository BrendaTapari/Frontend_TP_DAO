import { useLocation } from "wouter";


export default function Navbar() {
  const [, setLocation] = useLocation()

  const handleBackHome = () => {
    setLocation("/")
  } 
  
  return (
    <>
      <div className="navbar absolute top-0 w-full z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent justify-center pt-4 pb-8">
        <div className="flex justify-center items-center">
          <a className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r rounded-fullrea"></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex justify-center">
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-400 hover:cursor-pointer transition-all duration-700 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "2.2rem",
                    fontWeight: 300,
                    letterSpacing: "0.25em",
                    marginLeft: "0.25em" 
                  }}
                  onClick={() => handleBackHome()}
                >
                  LuxDrive
                </span>
              </div>
            </div>
          </a>
        </div>
        <div className="flex-none">
          <div className="hidden md:flex items-center space-x-1"></div>
        </div>
      </div>
    </>
  );
}
