import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import esTranslations from '../locales/es.json';
import enTranslations from '../locales/en.json';
import deTranslations from '../locales/de.json';
import ptTranslations from '../locales/pt.json';

// Evita re-inicializar si ya existe la instancia
if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: {
        es: { translation: esTranslations },
        en: { translation: enTranslations },
        de: { translation: deTranslations },
        pt: { translation: ptTranslations }
      },
      lng: 'es', // Idioma base por defecto inicial
      fallbackLng: 'es',
      interpolation: {
        escapeValue: false
      }
    });
}

export default i18n;