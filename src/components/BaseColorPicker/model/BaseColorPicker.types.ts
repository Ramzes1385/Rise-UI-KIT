import type { CustomClassProp } from '@composables/useCustomClass'

/** Позиция всплывающей панели относительно триггера */
export const COLOR_PICKER_POSITIONS = ['top', 'bottom', 'left', 'right'] as const

export type ColorPickerPosition = (typeof COLOR_PICKER_POSITIONS)[number]

/** Набор пресетов по умолчанию */
export const DEFAULT_COLOR_PRESETS = [
	'#f97316',
	'#ef4444',
	'#f59e0b',
	'#22c55e',
	'#06b6d4',
	'#3b82f6',
	'#a855f7',
	'#ec4899',
	'#ffffff',
	'#9ca3af',
	'#4b5563',
	'#000000',
] as const

/** Пропсы компонента BaseColorPicker */
export interface BaseColorPickerProps {
	/** Текущий цвет в формате HEX */
	modelValue: string
	/** Позиция всплывающей панели */
	position?: ColorPickerPosition
	/** Набор цветов-пресетов (HEX) */
	presets?: readonly string[]
	/** Скрыть поле ручного ввода HEX */
	isHexHidden?: boolean
	/** Скрыть набор пресетов */
	isPresetsHidden?: boolean
	/** Показать кнопку сброса цвета */
	isResettable?: boolean
	/** Подпись кнопки сброса */
	resetLabel?: string
	/** Не заливать swatch цветом значения (фон триггера задаётся снаружи или слотом) */
	hasTransparentSwatch?: boolean
	/** Заблокировать компонент */
	isDisabled?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/** События компонента BaseColorPicker */
export interface BaseColorPickerEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'change', value: string): void
	(event: 'reset'): void
}

/** Слоты компонента BaseColorPicker */
export interface BaseColorPickerSlots {
	trigger?: () => unknown
}
