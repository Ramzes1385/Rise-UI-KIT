import type { Ref } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** У блока одно оформление: он только прилипает, фона и рамки нет */
export const AFFIX_VARIANTS = ['default'] as const

/** Части блока для пропа `ui`: root — корень (других частей нет) */
export const AFFIX_PARTS = ['root'] as const

export type BaseAffixPart = (typeof AFFIX_PARTS)[number]

/**
 * Контейнер прокрутки, относительно которого блок считается прилипшим: CSS-селектор, элемент или `null` (окно).
 * Сам блок прилипает средствами CSS (`position: sticky`) к ближайшему предку с прокруткой; `target` нужен,
 * если именно этот контейнер отсчитывает отступы
 */
export type AffixTarget = string | HTMLElement | null

/** `variant` и `color` не используются: блок оформления не имеет. */
export interface BaseAffixProps extends BaseComponentProps<(typeof AFFIX_VARIANTS)[number], 'root'> {
	/**
	 * Отступ от верхнего края контейнера прокрутки, px: блок прилипает, когда до верха остаётся столько.
	 * Без `offsetTop` и `offsetBottom` блок прилипает к верху с отступом 0
	 */
	offsetTop?: number
	/** Отступ от нижнего края контейнера прокрутки, px: блок прилипает к низу. Вместе с `offsetTop` блок прилипает с обеих сторон */
	offsetBottom?: number
	/** Контейнер прокрутки: селектор, элемент или `null` — окно */
	target?: AffixTarget
	/** Тень у прилипшего блока: на границе, где он прилип. Цвет и размер — токен `--rise-affix-shadow` */
	hasShadow?: boolean
	/**
	 * Классы корня: добавляются к БЭМ-классу кита, глобальные — `defaults.BaseAffix.ui`.
	 *
	 * @example
	 * <BaseAffix :ui="{ root: 'bg-white' }" />
	 */
	ui?: UiProp<BaseAffixPart>
}

export interface BaseAffixEmits {
	/** Блок прилип (`true`) или вернулся на место (`false`) */
	(event: 'change', isFixed: boolean): void
}

export interface BaseAffixSlots {
	/** Содержимое блока. Слот получает `isFixed` — прилип ли блок сейчас */
	default?: (props: { isFixed: boolean }) => unknown
}

export type AffixProps = PropsWithDefaults<BaseAffixProps, 'target' | 'hasShadow'>

/** Стороны, к которым блок прилипает, px; `undefined` — к этой стороне не прилипает */
export interface AffixOffsets {
	top: number | undefined
	bottom: number | undefined
}

/** Наблюдатель за прилипанием: передаётся элемент блока */
export interface AffixObserverOptions {
	elementRef: Ref<HTMLElement | null>
	offsets: () => AffixOffsets
	target: () => AffixTarget
	onChange: (isFixed: boolean) => void
}
