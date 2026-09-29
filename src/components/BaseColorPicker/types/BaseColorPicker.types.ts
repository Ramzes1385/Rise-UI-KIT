import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Позиция всплывающей панели относительно триггера */
export const COLOR_PICKER_POSITIONS = ['top', 'bottom', 'left', 'right'] as const

export type ColorPickerPosition = (typeof COLOR_PICKER_POSITIONS)[number]

export interface BaseColorPickerProps extends BaseComponentProps<string, 'root' | 'swatch' | 'panel' | 'preset' | 'reset'> {
	/** Цвет в HEX (v-model): `#rrggbb` или `#rgb`; выбранный пресет и введённый HEX приходят в модель без искажений */
	modelValue: string
	/** Сторона, с которой открывается панель */
	position?: ColorPickerPosition
	/** Цвета-пресеты под областью выбора (по умолчанию — 12 цветов) */
	presets?: readonly string[]
	/** Скрыть поле ввода HEX */
	isHexHidden?: boolean
	/** Скрыть пресеты */
	isPresetsHidden?: boolean
	/** Показать кнопку сброса цвета (событие `reset`) */
	isResettable?: boolean
	/** Текст кнопки сброса */
	resetLabel?: string
	/** Не заливать образец цветом — для своего содержимого в слоте `trigger` (например, иконки) */
	hasTransparentSwatch?: boolean
	/** Отключённое состояние: образец не открывает панель */
	isDisabled?: boolean
}

export interface BaseColorPickerEmits {
	/** Новый цвет (v-model) */
	(event: 'update:modelValue', value: string): void
	/** Цвет изменён пользователем: пресет, HEX, тон или область выбора */
	(event: 'change', value: string): void
	/** Нажата кнопка сброса (`isResettable`) */
	(event: 'reset'): void
}

export interface BaseColorPickerSlots {
	/** Содержимое образца-триггера (например, иконка при `hasTransparentSwatch`) */
	trigger?: () => unknown
}
