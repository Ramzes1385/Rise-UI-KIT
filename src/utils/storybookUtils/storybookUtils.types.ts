/**
 * Мета-информация о пропе для генерации Storybook argTypes
 */
export interface PropMeta {
	/** Тип контрола Storybook */
	control?: string | ControlConfig
	/** Варианты для select/radio/inline-radio */
	options?: readonly (string | number)[]
	/** Описание пропа */
	description?: string
	/** Настройки таблицы */
	table?: Record<string, unknown>
}

/**
 * Конфиг контрола Storybook
 */
export interface ControlConfig {
	type: string
	[key: string]: unknown
}

/**
 * Опции утилиты buildArgTypes
 */
export interface BuildArgTypesOptions {
	/** Мета-информация по пропам компонента */
	props: Record<string, PropMeta>
	/** Скрытые пропы (по умолчанию class, style, key, ref) */
	hidden?: string[]
}
