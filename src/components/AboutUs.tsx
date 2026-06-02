import { MapPin, Phone, Clock, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AboutUs() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-black text-white pt-40 px-6 pb-24">
      <section className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1
            className="text-5xl md:text-7xl font-bold mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("about_us.title")}
          </h1>

          <div className="w-24 h-[2px] bg-primary mx-auto mb-8"></div>

          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {t("about_us.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 hover:border-primary transition-all">
            <ShieldCheck className="text-primary mb-5" size={42} />
            <h2 className="text-2xl font-bold mb-4">{t("about_us.trust_title")}</h2>
            <p className="text-gray-400">
              {t("about_us.trust_desc")}
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 hover:border-primary transition-all">
            <MapPin className="text-primary mb-5" size={42} />
            <h2 className="text-2xl font-bold mb-4">{t("about_us.location_title")}</h2>
            <a
              href="https://www.google.com/maps/search/Ayacucho+386,+Córdoba,+Argentina"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
            >
              <p>Ayacucho 386</p>
              <p className="text-gray-500 mt-2">Córdoba, Argentina</p>
            </a>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 hover:border-primary transition-all">
            <Phone className="text-primary mb-5" size={42} />
            <h2 className="text-2xl font-bold mb-4">{t("about_us.whatsapp_title")}</h2>
            <a
              href="https://wa.me/5493512517757"
              target="_blank"
              rel="noreferrer"
              className="text-primary text-xl font-semibold hover:underline"
            >
              +54 9 3512517757
            </a>
            <p className="text-gray-500 mt-2">{t("about_us.whatsapp_desc")}</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-10 text-center">
          <Clock className="text-primary mx-auto mb-5" size={44} />
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t("about_us.closing_title")}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t("about_us.closing_desc")}
          </p>
        </div>
      </section>
    </main>
  );
}
