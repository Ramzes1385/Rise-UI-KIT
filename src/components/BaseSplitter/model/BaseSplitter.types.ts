import type { BaseComponentProps } from '@composables/useBaseComponent'

/** Варианты оформления: `default` — линия с ручкой, `ghost` — линия проявляется при наведении и в фокусе */
export const SPLITTER_VARIANTS = ['default', 'ghost'] as const

/** Расположение панелей: `horizontal` — рядом (разделитель вертикальный), `vertical` — одна над другой */
export type SplitterOrientation = 'horizontal' | 'vertical'

/**
 * Пропсы компонента BaseSplitter.
 * `sizeScale` масштабирует толщину разделителя и ручку; `color` не используется.
 */
export interface BaseSplitterProps extends BaseComponentProps<(typeof SPLITTER_VARIANTS)[number], 'root' | 'pane' | 'separator'> {
	/** Размер первой панели в процентах (v-model) */
	modelValue?: number
	/** Расположение панелей */
	orientation?: SplitterOrientation
	/** Наименьший размер первой панели, % */
	min?: number
	/** Наибольший размер первой панели, % */
	max?: number
	/** Шаг стрелок клавиатуры, % */
	step?: number
	/** Имя разделителя для скринридера (по умолчанию «Размер панелей»); лучше назвать первую панель: «Список писем» */
	label?: string
	/** Разделитель не двигается и не получает фокус */
	isDisabled?: boolean
}

/**
 * События компонента BaseSplitter
 */
export interface BaseSplitterEmits {
	/** Размер первой панели при каждом движении */
	(event: 'update:modelValue', value: number): void
	/** Итоговый размер: отпущен указатель или нажата клавиша — чтобы сохранить его */
	(event: 'change', value: number): void
}

/**
 * Слоты компонента BaseSplitter
 */
export interface BaseSplitterSlots {
	/** Первая панель (слева или сверху) */
	start?: () => unknown
	/** Вторая панель (справа или снизу) */
	end?: () => unknown
}
