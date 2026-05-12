import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import pt from "./locales/pt.json";
import ar from "./locales/ar.json";

const resources = {
  es: { translation: es },
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
  pt: { translation: pt },
  ar: { translation: ar },
};

const applyDocumentLanguage = (lng: string) => {
  const normalizedLanguage = lng.split("-")[0];

  document.documentElement.lang = normalizedLanguage;
  document.documentElement.dir = normalizedLanguage === "ar" ? "rtl" : "ltr";
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("language") || "es",
  fallbackLng: "es",
  supportedLngs: ["es", "en", "fr", "de", "pt", "ar"],
  interpolation: {
    escapeValue: false,
  },
});

applyDocumentLanguage(i18n.language);

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
  applyDocumentLanguage(lng);
});

export default i18n;
