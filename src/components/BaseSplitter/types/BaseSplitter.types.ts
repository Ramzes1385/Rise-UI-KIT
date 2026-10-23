import type { UiProp } from '@composables/base/useUi'
import type { ComputedRef, Ref, StyleValue } from 'vue'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления: `default` — линия с ручкой, `ghost` — линия проявляется при наведении и в фокусе */
export const SPLITTER_VARIANTS = ['default', 'ghost'] as const

/** Части разделителя для пропа `ui`: root — корень, pane — панель, separator — разделитель, handle — ручка на разделителе */
export const SPLITTER_PARTS = ['root', 'pane', 'separator', 'handle'] as const

export type BaseSplitterPart = (typeof SPLITTER_PARTS)[number]

/** Расположение панелей: `horizontal` — рядом (разделитель вертикальный), `vertical` — одна над другой */
export type SplitterOrientation = 'horizontal' | 'vertical'

/** `sizeScale` масштабирует толщину разделителя и ручку; `color` не используется. */
export interface BaseSplitterProps extends BaseComponentProps<(typeof SPLITTER_VARIANTS)[number], 'root' | 'pane' | 'separator'> {
	/** Размер первой панели в процентах (v-model) — для двух панелей */
	modelValue?: number
	/**
	 * Размеры всех панелей в процентах, в сумме 100 (`v-model:sizes`). Режим нескольких панелей: столько панелей, сколько значений,
	 * со слотами `pane-1`, `pane-2`…; `min` и `max` тогда ограничивают каждую панель, а `modelValue` не используется
	 */
	sizes?: number[]
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
	/** Имена разделителей при нескольких панелях — по панели перед разделителем: «Папки», «Список писем»; по умолчанию — `label` с номером */
	paneLabels?: string[]
	/** Разделитель не двигается и не получает фокус */
	isDisabled?: boolean
	/**
	 * Классы частей: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseSplitter.ui`.
	 *
	 * @example
	 * <BaseSplitter :ui="{ pane: 'p-4', handle: 'opacity-60' }" />
	 */
	ui?: UiProp<BaseSplitterPart>
}

export interface BaseSplitterEmits {
	/** Размер первой панели при каждом движении */
	(event: 'update:modelValue', value: number): void
	/** Итоговый размер: отпущен указатель или нажата клавиша — чтобы сохранить его */
	(event: 'change', value: number): void
	/** Размеры всех панелей при каждом движении — в режиме `sizes` */
	(event: 'update:sizes', value: number[]): void
	/** Итоговые размеры всех панелей в режиме `sizes` — чтобы сохранить их */
	(event: 'sizes-change', value: number[]): void
}

export interface BaseSplitterSlots {
	/** Первая панель (слева или сверху) */
	start?: () => unknown
	/** Вторая панель (справа или снизу) */
	end?: () => unknown
	/** Панели в режиме `sizes`: `pane-1`, `pane-2`… слева направо или сверху вниз */
	[key: `pane-${number}`]: () => unknown
}

export type SplitterProps = PropsWithDefaults<BaseSplitterProps, 'modelValue' | 'orientation' | 'min' | 'max' | 'step' | 'isDisabled'>

/** Имя слота панели */
type SplitterPaneSlot = 'start' | 'end' | `pane-${number}`

/** Размеры панелей, %: работают и без v-model */
export interface SplitterSizes {
	sizes: Ref<number[]>
	/** Режим `sizes`: панели заданы массивом размеров */
	isMulti: ComputedRef<boolean>
	/** Границы панели `index`: двигается только граница между ней и следующей */
	boundsOf: (index: number) => [number, number]
	/** Новый размер панели `index` в её границах; соседняя получает остаток; `isFinal` — итог движения, для события `change` */
	setSize: (index: number, value: number, isFinal: boolean) => void
	/** Сообщить итоговые размеры: `change` или `sizes-change` */
	emitChange: () => void
}

/** Панель для шаблона */
export interface SplitterPane {
	id: string
	slot: SplitterPaneSlot
	modifier: string | undefined
	style: StyleValue
}

/** Атрибуты разделителя после панели */
export interface SplitterSeparator {
	'aria-label': string
	'aria-valuenow': number
	'aria-valuemin': number
	'aria-valuemax': number
	'aria-controls': string
}
