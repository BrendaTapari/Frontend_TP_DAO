import { useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import ParticleBackground from "./components/ParticleBackground";
import CarCarousel from "./components/CarCarousel";
import PremiumFeatures from "./components/PremiumFeatures";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { useVisibleFocus } from "./hooks/useVisibleFocus";
import { useTranslation } from "react-i18next";

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
  const appRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  // Scroll para efectos parallax
  const { scrollY } = useScroll();

  // Transformaciones basadas en scroll
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 0.95]);

  useVisibleFocus(
    appRef as React.RefObject<HTMLElement | null>,
    "button, a, [role='listitem'], input",
  );

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

  const handleScrollIconKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    }
  };

  // Componente reutilizable para animaciones de scroll entrada
  const ScrollReveal = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start 0.9", "start 0.25"],
    });

    const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
    const y = useTransform(scrollYProgress, [0, 1], [80, 0]);

    return (
      <motion.div
        ref={ref}
        style={{ opacity, y }}
        transition={{ delay, duration: 0.8 }}
      >
        {children}
      </motion.div>
    );
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
        alt={t("landing.logo")}
        className="h-24 w-auto sm:h-28 drop-shadow-[0_0_28px_rgba(255,255,255,0.18)]"
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
          {t("landing.logo")}
        </p>

        <p
          className="mt-1 text-[0.65rem] sm:text-xs uppercase tracking-[0.45em] text-white/50"
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontWeight: 200,
          }}
        >
          {t("landing.tagline")}
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
    <div ref={appRef}>
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
            aria-label={t("landing.welcome_screen_label")}
          >
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 0.5px, transparent 0.5px)",
                backgroundSize: "60px 60px",
              }}
            />

            <motion.div
              className="absolute w-72 h-72 rounded-full bg-primary/5"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

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

            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <AnimatedLogo />
            </motion.div>

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
                {t("landing.loading_experience")}
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* HERO SECTION */}
      <header
        className="relative min-h-screen w-full flex flex-col overflow-hidden"
        role="banner"
        ref={scrollContainerRef}
      >
        <motion.div
          className="absolute inset-0 w-full h-full"
          style={{ y: heroY }}
        >
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
            aria-hidden="true"
          >
            <source src="/Videos/output.webm" type="video/webm" />
          </video>
        </motion.div>

        <div
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <ParticleBackground />
        </div>

        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-base-100 z-0 pointer-events-none"
          aria-hidden="true"
          style={{ opacity: heroOpacity }}
        ></motion.div>

        <motion.div
          ref={heroRef}
          className="relative z-10 w-full max-w-4xl px-6 sm:px-10 flex flex-col justify-start pt-[48vh] sm:pt-[52vh] lg:pt-[55vh] pb-2 mx-auto lg:mx-0 lg:ml-20"
          style={{ y: heroY, scale: heroScale }}
        >
          <div className="mb-6 text-center lg:text-left">
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.5rem, 8vw, 4rem)",
                lineHeight: "1.2",
              }}
            >
              <motion.h1
                className="text-white drop-shadow-md"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {t("landing.hero_line1")}
              </motion.h1>

              <motion.h1
                className="text-white drop-shadow-md"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                {t("landing.hero_line2")}
              </motion.h1>
            </div>
          </div>

          <motion.button
            className="outlineButton px-6 py-3 rounded-xl font-semibold w-full sm:w-max bg-black/20 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1rem, 4vw, 1.4rem)",
              letterSpacing: "2px",
            }}
            onClick={handleAlquilaYaButton}
            aria-label={t("landing.rent_now")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            {t("landing.rent_now")}
          </motion.button>
        </motion.div>

        {showIconSroll && (
          <motion.button
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 focus:outline-2 focus:outline-offset-2 focus:outline-primary rounded-lg"
            onClick={() =>
              window.scrollTo({
                top: window.innerHeight,
                behavior: "smooth",
              })
            }
            onKeyDown={handleScrollIconKeyDown}
            aria-label={t("landing.scroll_down_label")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <motion.div
              className="flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity p-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span
                className="text-white mb-2 font-light tracking-wide uppercase text-sm"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t("landing.scroll_down")}
              </span>

              <ChevronDown className="w-10 h-10 text-white" />
            </motion.div>
          </motion.button>
        )}
      </header>

      {/* FLOTA */}
      <section
        className="w-full bg-base-100 py-16 px-4 sm:px-6 lg:px-12 flex flex-col justify-center relative z-10 min-h-screen"
        aria-labelledby="fleet-heading"
      >
        <div className="max-w-[90rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center h-full">
          <ScrollReveal>
            <div className="flex flex-col justify-center text-center lg:text-left space-y-8 sm:space-y-10 order-2 lg:order-1 mt-6 lg:mt-0 max-w-3xl mx-auto lg:mx-0">
              <div className="space-y-5 sm:space-y-6">
                <motion.h2
                  id="fleet-heading"
                  className="text-3xl sm:text-4xl lg:text-7xl font-bold text-white leading-tight drop-shadow-xl"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {t("landing.fleet_heading")} <br />
                  <motion.span
                    className="text-primary italic font-light"
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    {t("landing.fleet_location")}
                  </motion.span>
                </motion.h2>

                <motion.p
                  className="text-base sm:text-lg lg:text-2xl text-gray-300 font-light leading-relaxed max-w-xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  {t("landing.fleet_description")}
                </motion.p>
              </div>

              <div className="pt-4">
                <motion.button
                  className="outlineButton w-full sm:w-auto px-8 sm:px-12 py-4 rounded-full text-sm md:text-base tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 shadow-2xl hover:shadow-primary/30 focus:outline-2 focus:outline-offset-2 focus:outline-primary"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  onClick={() => setLocation("/car-fleet")}
                  aria-label={t("landing.view_fleet")}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t("landing.view_fleet")}
                </motion.button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <motion.div
              className="w-full flex justify-center lg:justify-end order-1 lg:order-2"
              initial={{ opacity: 0, x: 50, rotate: -5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="w-full relative">
                <motion.div
                  className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full pointer-events-none"
                  aria-hidden="true"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                ></motion.div>

                <div className="relative z-10 w-full">
                  <CarCarousel />
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* PREMIUM FEATURES */}
      <motion.section
        className="min-h-screen"
        aria-label="Características Premium"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <PremiumFeatures />
      </motion.section>
    </div>
  );
}

export default App;
