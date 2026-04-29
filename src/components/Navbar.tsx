import { useState } from "react";
import { useLocation } from "wouter";

export default function Navbar() {
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleBackHome = () => {
    setLocation("/");
  };

  const goTo = (path: string) => {
    setLocation(path);
    setMobileOpen(false);
  };

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
                    marginLeft: "0.25em",
                  }}
                  onClick={() => handleBackHome()}
                >
                  LuxDrive
                </span>
              </div>
            </div>
          </a>
        </div>

        <div className="flex-none pr-4">
          <div
            className={`dropdown dropdown-end ${mobileOpen ? "dropdown-open" : ""}`}
          >
            <label className="btn btn-circle swap swap-rotate border border-white/10 bg-black/20 text-zinc-100 hover:bg-white/10 hover:border-white/20 shadow-lg backdrop-blur-sm">
              <input
                type="checkbox"
                checked={mobileOpen}
                onChange={(event) => setMobileOpen(event.target.checked)}
                aria-label="Abrir menú"
                aria-expanded={mobileOpen}
              />

              <svg
                className="swap-off fill-current"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 512 512"
              >
                <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
              </svg>

              <svg
                className="swap-on fill-current"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 512 512"
              >
                <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
              </svg>
            </label>

            <ul
              tabIndex={0}
              role="menu"
              className={`dropdown-content z-[100] menu p-3 mt-4 w-56 rounded-2xl border border-white/10 bg-black/85 shadow-2xl backdrop-blur-md transition-all duration-200 ${
                mobileOpen
                  ? "pointer-events-auto opacity-100 translate-y-0"
                  : "pointer-events-none opacity-0 -translate-y-2"
              }`}
            >
              <li>
                <button
                  role="menuitem"
                  onClick={() => goTo("/car-fleet")}
                  className="text-zinc-100 text-base"
                >
                  Ver flota
                </button>
              </li>
              <li>
                <button
                  role="menuitem"
                  onClick={() => goTo("/add-rental")}
                  className="text-base text-black bg-amber-500 hover:bg-amber-400"
                >
                  Alquilar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
