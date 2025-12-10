import { useState, useEffect } from 'react';
import { ja } from '../locales/ja';
import { en } from '../locales/en';

const locales = { ja, en };

export function useI18n() {
    const [locale, setLocale] = useState('ja'); // Default to ja for safety, effect will update it

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        const targetLocale = locales[browserLang] ? browserLang : 'en';
        setLocale(targetLocale);
    }, []);

    const t = (key, params = {}) => {
        const keys = key.split('.');
        let value = locales[locale];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }

        if (typeof value === 'string' && params) {
            return Object.keys(params).reduce((acc, paramKey) => {
                return acc.replace(`{${paramKey}}`, params[paramKey]);
            }, value);
        }

        return value;
    };

    return { t, locale };
}
