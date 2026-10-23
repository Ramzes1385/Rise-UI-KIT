import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** У стека одно оформление: он задаёт только раскладку, фона и рамки нет */
export const STACK_VARIANTS = ['default'] as const

/** Направление главной оси, как у `flex-direction` */
export const STACK_DIRECTIONS = ['column', 'row', 'column-reverse', 'row-reverse'] as const

export type StackDirection = (typeof STACK_DIRECTIONS)[number]

/** Промежутки между элементами: `none` — без промежутка, `xs` 4px, `sm` 8px, `md` 16px, `lg` 24px, `xl` 32px (при `sizeScale` 100 и плотности 1) */
export const STACK_GAPS = ['none', 'xs', 'sm', 'md', 'lg', 'xl'] as const

export type StackGap = (typeof STACK_GAPS)[number]

/** Выравнивание по поперечной оси (`align-items`) */
export const STACK_ALIGNS = ['start', 'center', 'end', 'stretch', 'baseline'] as const

export type StackAlign = (typeof STACK_ALIGNS)[number]

/** Распределение по главной оси (`justify-content`) */
export const STACK_JUSTIFIES = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const

export type StackJustify = (typeof STACK_JUSTIFIES)[number]

/** Части стека для пропа `ui`: root — корень (других частей нет) */
export const STACK_PARTS = ['root'] as const

export type BaseStackPart = (typeof STACK_PARTS)[number]

/** `sizeScale` масштабирует промежутки; `variant` и `color` не используются. */
export interface BaseStackProps extends BaseComponentProps<(typeof STACK_VARIANTS)[number], 'root'> {
	/** Направление: `column` — столбиком, `row` — в строку, `*-reverse` — в обратном порядке */
	direction?: StackDirection
	/** Промежуток между элементами. Токен `--rise-stack-gap` задаёт его для любого значения, кроме `none` */
	gap?: StackGap
	/** Выравнивание по поперечной оси */
	align?: StackAlign
	/** Распределение по главной оси */
	justify?: StackJustify
	/** Переносить элементы на новую линию, когда они не помещаются */
	isWrap?: boolean
	/** Строчный стек (`inline-flex`): занимает ширину содержимого и стоит в строке текста; по умолчанию — блочный */
	isInline?: boolean
	/** Тег корня: `div`, `section`, `ul`, `nav`… Для `ul` и `ol` дочерние элементы — `li` */
	tag?: string
	/**
	 * Классы корня: добавляются к БЭМ-классу кита, глобальные — `defaults.BaseStack.ui`.
	 *
	 * @example
	 * <BaseStack :ui="{ root: 'p-4' }" />
	 */
	ui?: UiProp<BaseStackPart>
}

export interface BaseStackSlots {
	/** Элементы стека */
	default?: () => unknown
}

export type StackProps = PropsWithDefaults<BaseStackProps, 'direction' | 'gap' | 'align' | 'justify' | 'isWrap' | 'isInline' | 'tag'>
