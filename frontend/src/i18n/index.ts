import { en, type Dict } from './locales/en';
import { ru } from './locales/ru';
import { uz } from './locales/uz';

export type { Dict };

/** Supported locales, in display order. Native labels are shown in the switcher. */
export const LANGUAGES = [
  { code: 'ru', short: 'RU', label: 'Русский' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'uz', short: 'UZ', label: "O'zbek" },
] as const;

export type Language = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: Language = 'ru';

export const dictionaries: Record<Language, Dict> = { en, ru, uz };

export function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'ru' || value === 'uz';
}
