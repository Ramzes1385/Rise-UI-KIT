import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { StackGap } from '@components/BaseStack/types/BaseStack.types'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** У сетки одно оформление: она задаёт только раскладку, фона и рамки нет */
export const GRID_VARIANTS = ['default'] as const

/**
 * Брейкпоинты значений по ширине окна, те же, что у `useBreakpoint` и SCSS-карты `$breakpoints`:
 * `sm` от 480px, `md` от 768px, `lg` от 1024px, `xl` от 1440px. Значение действует от своего брейкпоинта и выше
 */
export const GRID_BREAKPOINTS = ['sm', 'md', 'lg', 'xl'] as const

export type GridBreakpoint = (typeof GRID_BREAKPOINTS)[number]

/**
 * Значение, которое можно задать по брейкпоинтам: число (или строка) для любой ширины либо объект `{ base, sm, md, lg, xl }`.
 * `base` — для ширины меньше `sm`; не заданный брейкпоинт наследует значение меньшего.
 */
export type GridResponsive<T> = T | ({ base?: T } & Partial<Record<GridBreakpoint, T>>)

/** Шаг ширины: `base` — любая ширина, остальные — брейкпоинты */
export type GridStep = 'base' | GridBreakpoint

/** Значения по шагам ширины */
export type StepValues<T> = Partial<Record<GridStep, T>>

/** Части сетки для пропа `ui`: root — корень (других частей нет) */
export const GRID_PARTS = ['root'] as const

export type BaseGridPart = (typeof GRID_PARTS)[number]

/** `sizeScale` масштабирует промежутки; `variant` и `color` не используются. */
export interface BaseGridProps extends BaseComponentProps<(typeof GRID_VARIANTS)[number], 'root'> {
	/**
	 * Число колонок равной ширины: число или объект по брейкпоинтам, например `{ base: 1, md: 2, lg: 4 }`.
	 * Ширина колонок не зависит от содержимого: длинное слово не растягивает колонку
	 */
	cols?: GridResponsive<number>
	/** Промежуток между колонками и строками: `none`, `xs` 4px, `sm` 8px, `md` 16px, `lg` 24px, `xl` 32px (при `sizeScale` 100 и плотности 1) */
	gap?: StackGap
	/** Промежуток между строками, если он должен отличаться от `gap` */
	rowGap?: StackGap
	/** Тег корня: `div`, `section`, `ul`… */
	tag?: string
	/**
	 * Классы корня: добавляются к БЭМ-классу кита, глобальные — `defaults.BaseGrid.ui`.
	 *
	 * @example
	 * <BaseGrid :ui="{ root: 'p-4' }" />
	 */
	ui?: UiProp<BaseGridPart>
}

export interface BaseGridSlots {
	/** Ячейки сетки: `BaseGridItem` или любые элементы (занимают по одной колонке) */
	default?: () => unknown
}

export type GridProps = PropsWithDefaults<BaseGridProps, 'cols' | 'gap' | 'tag'>
