// packages/i18n/src/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import { en } from './locales/en';
import { lo } from './locales/lo';
import { th } from './locales/th';

export const defaultNS = 'common';
export const namespaces = ['common', 'admin'];

export const resources = { en, lo, th } as const;

export const initI18n = () => {
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources,
            lng: 'en',
            fallbackLng: 'en',
            defaultNS,
            ns: namespaces,
            interpolation: {
                escapeValue: false // React already escapes
            },
            detection: {
                order: ['localStorage', 'navigator'],
                caches: ['localStorage']
            }
        });

    return i18n;
};

// Export for type safety
export type Language = keyof typeof resources;
export type Namespace = keyof typeof resources.en;

export default i18n;