import { Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const handleBackHome = () => {
    setLocation("/");
  };

  const goTo = (path: string) => {
    setLocation(path);
    setMobileOpen(false);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <>
      <div className="navbar absolute top-0 z-50 flex w-full justify-center bg-gradient-to-b from-black/90 via-black/50 to-transparent pt-4 pb-8">
        <div className="relative flex w-full max-w-7xl items-center px-4 sm:px-6">
          <button
            type="button"
            onClick={handleBackHome}
            className="absolute left-1/2 -translate-x-1/2 text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-white to-zinc-400 transition-all duration-700 hover:cursor-pointer hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
              fontWeight: 300,
              letterSpacing: "0.25em",
              marginLeft: "0.25em",
            }}
          >
            {t("landing.logo")}
          </button>

          <div className="ml-auto flex shrink-0 gap-3 items-center">
            <div className="dropdown dropdown-end">
              <button
                tabIndex={0}
                className="btn btn-circle border border-white/10 bg-black/20 text-zinc-100 shadow-lg backdrop-blur-sm hover:border-white/20 hover:bg-white/10 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                aria-label={t("nav.language")}
                title={t("nav.language")}
              >
                <Globe size={20} />
              </button>

              <ul
                tabIndex={0}
                role="menu"
                className="dropdown-content z-[100] menu mt-2 max-h-80 w-44 overflow-y-auto rounded-2xl border border-white/10 bg-black/85 p-2 shadow-2xl backdrop-blur-md"
              >
                <li>
                  <button
                    onClick={() => changeLanguage("es")}
                    className={`${
                      i18n.language === "es"
                        ? "bg-primary text-black"
                        : "text-zinc-100"
                    }`}
                    aria-current={i18n.language === "es" ? "page" : undefined}
                  >
                    Español
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => changeLanguage("en")}
                    className={`${
                      i18n.language === "en"
                        ? "bg-primary text-black"
                        : "text-zinc-100"
                    }`}
                    aria-current={i18n.language === "en" ? "page" : undefined}
                  >
                    English
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => changeLanguage("fr")}
                    className={`${
                      i18n.language === "fr"
                        ? "bg-primary text-black"
                        : "text-zinc-100"
                    }`}
                    aria-current={i18n.language === "fr" ? "page" : undefined}
                  >
                    Français
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => changeLanguage("de")}
                    className={`${
                      i18n.language === "de"
                        ? "bg-primary text-black"
                        : "text-zinc-100"
                    }`}
                    aria-current={i18n.language === "de" ? "page" : undefined}
                  >
                    Deutsch
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => changeLanguage("pt")}
                    className={`${
                      i18n.language === "pt"
                        ? "bg-primary text-black"
                        : "text-zinc-100"
                    }`}
                    aria-current={i18n.language === "pt" ? "page" : undefined}
                  >
                    Português
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => changeLanguage("ar")}
                    className={`${
                      i18n.language === "ar"
                        ? "bg-primary text-black"
                        : "text-zinc-100"
                    }`}
                    aria-current={i18n.language === "ar" ? "page" : undefined}
                  >
                    العربية
                  </button>
                </li>
              </ul>
            </div>

            <div
              className={`dropdown dropdown-end ${
                mobileOpen ? "dropdown-open" : ""
              }`}
            >
              <label className="btn btn-circle swap swap-rotate border border-white/10 bg-black/20 text-zinc-100 shadow-lg backdrop-blur-sm hover:border-white/20 hover:bg-white/10">
                <input
                  type="checkbox"
                  checked={mobileOpen}
                  onChange={(event) => setMobileOpen(event.target.checked)}
                  aria-label="Abrir menú"
                  aria-expanded={mobileOpen}
                />

                <Menu className="swap-off fill-current" />
                <X className="swap-on fill-current" />
              </label>

              <ul
                tabIndex={0}
                role="menu"
                className={`dropdown-content z-[100] menu mt-4 w-56 rounded-2xl border border-white/10 bg-black/85 p-3 shadow-2xl backdrop-blur-md transition-all duration-200 ${
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
                    {t("fleet.title")}
                  </button>
                </li>

                <li>
                  <button
                    role="menuitem"
                    onClick={() => goTo("/about-us")}
                    className="text-zinc-100 text-base"
                  >
                    {t("nav.about_us")}
                  </button>
                </li>

                <li>
                  <button
                    role="menuitem"
                    onClick={() => goTo("/add-rental")}
                    className="text-base text-black bg-amber-500 hover:bg-amber-400"
                  >
                    {t("landing.rent_now")}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
