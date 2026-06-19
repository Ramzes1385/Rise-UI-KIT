/**
 * Константы компонента BaseTable.
 * Группированы в объект TABLE для удобного доступа.
 */

import { UI_TIMING } from './ui'

export const TABLE = {
	/** Ширина колонки выбора строк */
	ROW_SELECTION_WIDTH: '40px',
	/** Ширина колонки номера строки */
	ROW_NUMBER_WIDTH: '40px',
	/** Ширина колонки раскрытия строки */
	ROW_EXPAND_WIDTH: '36px',
	/** Минимальная ширина колонки при ресайзе (px) */
	MIN_COL_WIDTH: 50,
	/** Порог срабатывания infinite scroll (px до низа) */
	INFINITE_SCROLL_THRESHOLD: 50,
	/** Количество строк скелетона по умолчанию */
	DEFAULT_SKELETON_ROWS: 5,
	/** Длительность анимации раскрытия/сворачивания строки (мс) */
	EXPAND_TRANSITION_DURATION: UI_TIMING.ANIMATION_DURATION,
	/** Максимальная высота панели настроек колонок */
	SETTINGS_MAX_HEIGHT: 'min(320px, 50vh)',
	/** Дебаунс поиска по умолчанию (мс) */
	SEARCH_DEBOUNCE_MS: UI_TIMING.DEBOUNCE_DEFAULT,
	/** Размер страницы по умолчанию */
	DEFAULT_PAGE_SIZE: 5,
	/** Максимальное количество видимых номеров страниц в пагинации */
	PAGINATION_MAX_VISIBLE: 4,
} as const
