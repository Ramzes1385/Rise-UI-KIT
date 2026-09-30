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

/** Записи: аудиоплеер, волна, диктофон */
export const UI_AUDIO = localized('audio')

/** Редактор субтитров */
export const UI_SUBTITLES = localized('subtitles')

/** Таблица: тексты и доступные имена элементов управления */
export const TABLE_TEXT = localized('table')

export const UI_CHAT_TEXT = localized('chat')

export const UI_EDITOR = localized('editor')

/** Markdown: блок кода и задачи */
export const UI_MARKDOWN = localized('markdown')

/** ИИ-чат: сообщение ассистента, рассуждение, вызов инструмента, поле запроса */
export const UI_AI = localized('ai')

export const UI_EMOJI = localized('emoji')

export const UI_MENTION = localized('mention')

/** Канбан-доска */
export const UI_KANBAN = localized('kanban')

/** Конструктор фильтров */
export const UI_FILTER_BUILDER = localized('filterBuilder')

/** Чек-лист первых шагов */
export const UI_CHECKLIST = localized('checklist')

/** Поле телефона */
export const UI_PHONE_INPUT = localized('phoneInput')

/** Поля реквизитов */
export const UI_REQUISITES = localized('requisites')

/** Палитра команд */
export const UI_COMMAND_PALETTE = localized('commandPalette')

/** Графики */
export const UI_CHARTS = localized('charts')

/** Сравнение картинок */
export const UI_IMAGE_COMPARE = localized('imageCompare')

/** Просмотр JSON */
export const UI_JSON_VIEWER = localized('jsonViewer')

/** Сравнение текстов */
export const UI_TEXT_DIFF = localized('textDiff')
