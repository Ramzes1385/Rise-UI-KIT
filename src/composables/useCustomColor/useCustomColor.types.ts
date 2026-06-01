/**
 * Цвета для одного свойства (background или text) с состояниями
 */
export interface ColorStates {
	/** Базовый цвет */
	base?: string
	/** Цвет при наведении */
	hover?: string
	/** Цвет при нажатии */
	active?: string
	/** Цвет при фокусе */
	focus?: string
}

/**
 * Кастомный цвет компонента: background и text раздельно
 */
export interface CustomColor {
	/** Кастомный цвет фона */
	bg?: ColorStates
	/** Кастомный цвет текста */
	text?: ColorStates
}

/**
 * Опции composable useCustomColor
 */
export interface UseCustomColorOptions {
	/** Геттер объекта кастомного цвета */
	getColor: () => CustomColor | undefined
}
