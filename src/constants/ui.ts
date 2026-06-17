/**
 * Глобальные константы UI-библиотеки.
 * Группированы в объекты для удобного доступа.
 */

// ─── Текст ────────────────────────────────────────────────────────

export const UI_TEXT = {
	EMPTY: 'Нет данных',
	NO_RESULTS: 'Ничего не найдено',
	SEARCH_PLACEHOLDER: 'Поиск...',
	TODAY: 'Сегодня',
	LOADING: 'Загрузка...',
	LOADING_ARIA: 'Загрузка',
	LOAD_MORE: 'Загрузить еще',
	IMAGE_ERROR: 'Ошибка загрузки',
	FILE_STATUS_DONE: 'Загружено',
	FILE_STATUS_ERROR: 'Ошибка',
	FILE_STATUS_PENDING: 'Ожидание',
	DELETE: 'Удалить',
	NO_COLOR: 'Без цвета',
	CANCEL: 'Отмена',
	APPLY: 'Применить',
	REQUIRED_FIELD: 'Обязательное поле',
	SELECT_PLACEHOLDER: 'Выберите...',
	SELECT_DATE: 'Выберите дату',
	EXPAND: 'Развернуть',
	COLLAPSE: 'Свернуть',
	FILE_SELECT: 'Выберите файлы',
	FILE_DROP: 'Перетащите файлы сюда',
	FILE_MAX_SIZE_PREFIX: 'до',
	FILE_MAX_SIZE_SUFFIX: 'МБ',
	FILE_MAX_COUNT_PREFIX: 'Максимум файлов:',
} as const

// ─── Aria-labels ───────────────────────────────────────────────────

export const UI_ARIA = {
	BREADCRUMBS: 'Навигация',
	CLOSE: 'Закрыть',
	PREV_YEAR: 'Предыдущий год',
	PREV_MONTH: 'Предыдущий месяц',
	NEXT_MONTH: 'Следующий месяц',
	NEXT_YEAR: 'Следующий год',
	SORT: 'Сортировать',
	PASSWORD_HIDE: 'Скрыть пароль',
	PASSWORD_SHOW: 'Показать пароль',
} as const

// ─── Тайминги (мс) ────────────────────────────────────────────────

export const UI_TIMING = {
	DEBOUNCE_DEFAULT: 300,
	ANIMATION_DURATION: 300,
	HOVER_DELAY: 200,
	TRANSITION_DURATION: 200,
	PROGRESS_INTERVAL: 200,
	TOOLTIP_SHOW_DELAY: 100,
	TOOLTIP_HIDE_DELAY: 150,
	SLIDER_HOLD_INTERVAL: 150,
	HIGHLIGHT_DURATION: 1500,
	NOTIFICATION_AUTO_CLOSE: 3000,
	IMAGE_LOAD_TIMEOUT: 5000,
} as const

// ─── Размеры ──────────────────────────────────────────────────────

export const UI_SIZE = {
	PANEL_MAX_HEIGHT: '320px',
	SIDEBAR_DEFAULT_WIDTH: 280,
	MODAL_DEFAULT_WIDTH: 500,
	CONTEXT_MENU_WIDTH: 200,
	CONTEXT_MENU_HEIGHT: 280,
	CHAT_DEFAULT_HEIGHT: '500px',
	SLIDER_DEFAULT_HEIGHT: '400px',
	IMAGE_LOADING_MIN_HEIGHT: '120px',
	MINIMAP_WIDTH: 200,
	MINIMAP_HEIGHT: 150,
	PROGRESS_CIRCLE_RADIUS: 52,
} as const

// ─── Масштаб ──────────────────────────────────────────────────────

export const UI_SCALE = {
	SMALL: 0.8,
	MEDIUM: 1.0,
	LARGE: 1.2,
	AUTOCOMPLETE: 0.85,
	ROTATION_STEP_DEG: 90,
	FULL_ROTATION_DEG: 360,
} as const

// ─── Font weight ──────────────────────────────────────────────────

export const UI_FONT_WEIGHT = {
	MEDIUM: 500,
	SEMIBOLD: 600,
	BOLD: 700,
} as const

// ─── Тур ──────────────────────────────────────────────────────────

export const UI_TOUR = {
	SKIP: 'Пропустить тур',
	NEXT: 'Далее',
	PREV: 'Назад',
	FINISH: 'Завершить',
	TITLE: 'Тур по интерфейсу',
} as const

// ─── Фильтр таблицы ───────────────────────────────────────────────

export const UI_FILTER = {
	COLUMN: 'Колонка',
	CONDITION: 'Условие',
	VALUE_PLACEHOLDER: 'Значение...',
} as const

// ─── Календарь ────────────────────────────────────────────────────

export const UI_CALENDAR = {
	EVENT_TEXT: 'Событие',
} as const

// ─── Color Picker ─────────────────────────────────────────────────

export const UI_COLOR_PICKER = {
	SELECTED_COLOR: 'Выбранный цвет',
	SATURATION_BRIGHTNESS: 'Насыщенность и яркость',
	HUE: 'Тон',
	HEX_VALUE: 'HEX-значение',
	PRESET: 'Пресет',
} as const

// ─── Rating ───────────────────────────────────────────────────────

export const UI_RATING = {
	ARIA_PREFIX: 'Оценка от 0 до',
} as const

// ─── Числовые константы ────────────────────────────────────────────

export const UI_PROGRESS_STEP_MIN = 5
export const UI_PROGRESS_STEP_RANGE = 20
export const CALENDAR_GRID_CELLS = 42
export const MS_PER_DAY = 86_400_000
export const SIZE_SCALE_DEFAULT = 100
/** Относительное уменьшение sizeScale для второстепенного контента (описания, иконки на кнопках) */
export const SIZE_SCALE_OFFSET = 10
/** Padding кнопки закрытия в модальном окне */
export const MODAL_CLOSE_BUTTON_PADDING = 2
export const DEFAULT_VARIANT = 'default'
