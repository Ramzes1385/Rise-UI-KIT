import type { BaseComponentProps } from '../../../types/base.types'

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
export interface BaseColorPickerProps extends BaseComponentProps<string, 'root' | 'swatch' | 'panel' | 'preset' | 'reset'> {
	modelValue: string; position?: ColorPickerPosition; presets?: readonly string[];
	isHexHidden?: boolean; isPresetsHidden?: boolean; isResettable?: boolean;
	resetLabel?: string; hasTransparentSwatch?: boolean; isDisabled?: boolean;
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
