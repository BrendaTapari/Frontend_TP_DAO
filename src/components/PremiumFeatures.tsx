import { MapPin, Bone, Baby, Clock, Zap, Shield, Wifi } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { useLocation } from "wouter";

export default function PremiumFeatures() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.5", "center 0"],
  });

  const [, setLocation] = useLocation();

  const handleAlquilaYaButton = () => {
    setLocation("/add-rental");
  }

  const backgroundY = useTransform(scrollYProgress, [0, 1], [100, 0]);

  const detailImages = [
    {
      src: "/Images/landing/niños_en_auto.webp",
      alt: t("premium_features.feature1_title"),
      objectPosition: "center 60%",
    },
    {
      src: "/Images/landing/gps.webp",
      alt: t("premium_features.feature2_title"),
      objectPosition: "center",
    },
    {
      src: "/Images/landing/autos_discapacitados.webp",
      alt: t("premium_features.feature3_title"),
      objectPosition: "center",
    },
  ];

  const luxuryFeatures = [
    {
      title: t("premium_features.feature1_title"),
      subtitle: t("premium_features.feature1_subtitle"),
      description: t("premium_features.feature1_desc"),
      icon: <Baby className="w-12 h-12" />,
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: t("premium_features.feature2_title"),
      subtitle: t("premium_features.feature2_subtitle"),
      description: t("premium_features.feature2_desc"),
      icon: <Wifi className="w-12 h-12" />,
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      title: t("premium_features.feature3_title"),
      subtitle: t("premium_features.feature3_subtitle"),
      description: t("premium_features.feature3_desc"),
      icon: <Zap className="w-12 h-12" />,
      gradient: "from-purple-500/20 to-pink-500/20",
    },
  ];

  const premiumServices = [
    {
      icon: <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />,
      title: t("premium_features.service1_title"),
      description: t("premium_features.service1_desc"),
    },
    {
      icon: <MapPin className="w-8 h-8 text-white" strokeWidth={1.5} />,
      title: t("premium_features.service2_title"),
      description: t("premium_features.service2_desc"),
    },
    {
      icon: <Clock className="w-8 h-8 text-white" strokeWidth={1.5} />,
      title: t("premium_features.service3_title"),
      description: t("premium_features.service3_desc"),
    },
    {
      icon: <Bone className="w-8 h-8 text-white" strokeWidth={1.5} />,
      title: t("premium_features.service4_title"),
      description: t("premium_features.service4_desc"),
    },
  ];
  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-28 lg:py-32 bg-gradient-to-b from-[#050505] to-black overflow-hidden snap-start"
    >
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ y: backgroundY }}
      >
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        ></motion.div>
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        ></motion.div>
      </motion.div>

      {/* Transition from previous section */}
      <motion.div
        className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-base-100 to-transparent pointer-events-none"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.5], [1, 0]) }}
      ></motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <motion.div className="text-center mb-14 sm:mb-20 lg:mb-24">
          <motion.h2
            className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-5 sm:mb-6 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {t("premium_features.title")}
          </motion.h2>
          <motion.div
            className="h-1 w-20 sm:w-24 bg-gradient-to-r from-primary via-primary/20 to-primary mx-auto mb-6 sm:mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
          ></motion.div>
          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-400 font-light max-w-2xl mx-auto px-2 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {t("premium_features.subtitle")}
          </motion.p>
        </motion.div>

        {/* Luxury Features with Images */}
        <motion.div className="space-y-16 sm:space-y-20 lg:space-y-24">
          {luxuryFeatures.map((feature, index) => (
            <motion.div
              key={index}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? "lg:grid-cols-2 lg:direction-rtl" : ""}`}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* Text Content */}
              <motion.div
                className={`${index % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 + 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="space-y-5 sm:space-y-6 text-center lg:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                    <motion.div
                      className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-primary flex items-center justify-center">
                        {feature.icon}
                      </div>
                    </motion.div>
                    <div>
                      <p className="text-primary text-sm uppercase tracking-widest font-semibold">
                        {feature.subtitle}
                      </p>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                        {feature.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-400 text-base sm:text-lg leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                    {feature.description}
                  </p>
                </div>
              </motion.div>

              {/* Image */}
              <motion.div
                className={`flex items-center justify-center ${index % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}
                initial={{
                  opacity: 0,
                  x: index % 2 === 0 ? 40 : -40,
                  rotate: index % 2 === 0 ? 5 : -5,
                }}
                whileInView={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 + 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.div
                  className="relative group w-full max-w-md"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  ></motion.div>
                  <motion.div
                    className="relative overflow-hidden rounded-3xl border border-white/10 group-hover:border-white/20 transition-all duration-500 h-[250px] sm:h-[350px] lg:h-[450px] w-full"
                    whileHover={{ borderColor: "rgba(255,255,255,0.4)" }}
                  >
                    <motion.img
                      src={detailImages[index]?.src}
                      alt={detailImages[index]?.alt}
                      className="w-full h-full object-cover"
                      style={{
                        objectPosition:
                          detailImages[index]?.objectPosition || "center",
                      }}
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.7 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent group-hover:from-black/60 transition-all duration-500"></div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="mt-20 sm:mt-28 lg:mt-32 pt-16 sm:pt-20 lg:pt-24 border-t border-white/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h3
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-10 sm:mb-14 lg:mb-16 text-center"
            style={{ fontFamily: "'Playfair Display', serif" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {t("premium_features.services_title")}
          </motion.h3>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              },
            }}
          >
            {premiumServices.map((service, index) => (
              <motion.div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur-sm p-6 sm:p-8 transition-all duration-500 hover:border-primary/50"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                whileHover={{ y: -8, borderColor: "rgba(var(--primary), 0.5)" }}
                transition={{ duration: 0.3 }}
              >
                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all duration-500 pointer-events-none"
                  whileHover={{ opacity: 1 }}
                ></motion.div>

                <div className="relative z-10">
                  <motion.div
                    className="mb-4 p-3 w-fit rounded-lg bg-primary/10 mx-auto lg:mx-0"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {service.icon}
                  </motion.div>

                  <motion.h4
                    className="text-lg font-bold text-white mb-3 text-center lg:text-left"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    {service.title}
                  </motion.h4>

                  <motion.p
                    className="text-gray-400 text-sm leading-relaxed font-light text-center lg:text-left"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    {service.description}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="mt-16 sm:mt-20 lg:mt-24 text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p
            className="text-gray-400 text-base sm:text-lg mb-6 sm:mb-8 px-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            {t("premium_features.cta_text")}
          </motion.p>
          <motion.button
            className="px-8 sm:px-12 py-4 btn btn-outline btn-primary text-white font-bold rounded-full text-base sm:text-lg w-full sm:w-auto max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAlquilaYaButton}
          >
            {t("premium_features.reserve_now")}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
