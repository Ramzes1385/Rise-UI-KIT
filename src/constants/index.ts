/**
 * Экспорт всех глобальных констант UI-библиотеки.
 *
 * Группированные объекты:
 *   import { UI_TEXT, UI_TIMING, UI_FONT_WEIGHT, UI_CHAT_TEXT, UI_EDITOR } from '@constants'
 *
 * Стиль: именованные реэкспорты (а не export *) — осознанный выбор:
 * константы = явный публичный API, каждый экспорт документирован.
 * Для сравнения: src/utils/index.ts использует export * (агрегация утилит).
 */

export { UI_ARIA, UI_CALENDAR, UI_COLOR_PICKER, UI_FILTER, UI_FONT_WEIGHT, UI_ICON_SPRITE_PATH, UI_RATING, UI_SCALE, UI_SIZE, UI_TEXT, UI_TIMING, UI_TOUR, CALENDAR_GRID_CELLS, DEFAULT_VARIANT, MODAL_CLOSE_BUTTON_PADDING, MS_PER_DAY, SIZE_SCALE_DEFAULT, SIZE_SCALE_OFFSET, UI_PROGRESS_STEP_MIN, UI_PROGRESS_STEP_RANGE } from './ui'
export { UI_CHAT_SCALE, UI_CHAT_TEXT } from './chat'
export { UI_EDITOR } from './editor'
export { TABLE } from './table'
