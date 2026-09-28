/** Строки интерфейса кита — разделы словаря текущего языка (`localized`), напр. `UI_ARIA.CLOSE`; в пакет не экспортируются, приложение меняет их через `defineLocale()`. */
import { localized } from './localized'

/** Общие подписи: кнопки, пустые состояния, статусы */
export const UI_TEXT = localized('text')

/** Доступные имена кнопок и областей */
export const UI_ARIA = localized('aria')

export const UI_TOUR = localized('tour')

/** Фильтр таблицы */
export const UI_FILTER = localized('filter')

export const UI_CALENDAR = localized('calendar')

export const UI_COLOR_PICKER = localized('colorPicker')

export const UI_RATING = localized('rating')

/** Таблица: тексты и доступные имена элементов управления */
export const TABLE_TEXT = localized('table')

export const UI_CHAT_TEXT = localized('chat')

export const UI_EDITOR = localized('editor')
