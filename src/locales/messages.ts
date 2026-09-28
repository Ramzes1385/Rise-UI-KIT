/**
 * Строки интерфейса для компонентов кита — разделы словаря текущего языка (`localized`).
 * `UI_ARIA.CLOSE` возвращает строку языка, выбранного `setLocale()`. В пакет не экспортируются:
 * приложение меняет строки через `defineLocale()`.
 */
import { localized } from './localized'

/** Общие подписи: кнопки, пустые состояния, статусы */
export const UI_TEXT = localized('text')

/** Доступные имена кнопок и областей */
export const UI_ARIA = localized('aria')

/** Тур */
export const UI_TOUR = localized('tour')

/** Фильтр таблицы */
export const UI_FILTER = localized('filter')

/** Календарь */
export const UI_CALENDAR = localized('calendar')

/** Выбор цвета */
export const UI_COLOR_PICKER = localized('colorPicker')

/** Рейтинг */
export const UI_RATING = localized('rating')

/** Таблица: тексты и доступные имена элементов управления */
export const TABLE_TEXT = localized('table')

/** Чат */
export const UI_CHAT_TEXT = localized('chat')

/** Редактор */
export const UI_EDITOR = localized('editor')
