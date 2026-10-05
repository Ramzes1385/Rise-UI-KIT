import type { UiProp } from '@composables/base/useUi'
import type { FabPosition } from '@components/BaseFab'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты — как у BaseFab: `default` — заливка основным цветом, `soft` — мягкий цвет, `outline` — фон и рамка */
export const BACK_TOP_VARIANTS = ['default', 'soft', 'outline'] as const

/**
 * Части кнопки для пропа `ui` (`root` — сама кнопка BaseFab с классом `.base-back-top`): icon — иконка
 * (`.base-back-top__icon`), label — подпись при `isExtended` (`.base-back-top__label`).
 */
export const BACK_TOP_PARTS = ['icon', 'label'] as const

export type BaseBackTopPart = (typeof BACK_TOP_PARTS)[number]

/** `sizeScale` и `color` — как у BaseFab. */
export interface BaseBackTopProps extends BaseComponentProps<(typeof BACK_TOP_VARIANTS)[number], 'root' | 'icon' | 'label'> {
	/** Прокручиваемый контейнер — CSS-селектор или элемент; по умолчанию окно */
	target?: string | HTMLElement
	/** Прокрутка (px), после которой появляется кнопка; новое значение применяется сразу, без ожидания прокрутки */
	visibilityHeight?: number
	/** Имя кнопки (по умолчанию «Наверх»); видно при isExtended */
	label?: string
	/** Иконка */
	icon?: string
	/** Широкая кнопка с подписью */
	isExtended?: boolean
	/** Угол окна (или контейнера при isContained) */
	position?: FabPosition
	/** В углу контейнера (position: absolute) вместо окна — контейнеру нужен position: relative */
	isContained?: boolean
	/**
	 * Куда перевести фокус после прокрутки — CSS-селектор или элемент. По умолчанию: контейнер из target,
	 * для окна — `<main>` страницы. Без этого фокус остался бы внизу, на исчезнувшей кнопке
	 */
	focusTarget?: string | HTMLElement
	/**
	 * Классы частей (`root`, `icon`, `label`) — добавляются к классам кита; глобально — `defaults.BaseBackTop.ui` плагина
	 *
	 * @example
	 * <BaseBackTop :ui="{ root: 'shadow-xl', icon: 'rotate-0' }" />
	 */
	ui?: UiProp<BaseBackTopPart>
}

export interface BaseBackTopEmits {
	(event: 'click', value: MouseEvent): void
}

export type BackTopProps = PropsWithDefaults<BaseBackTopProps, 'visibilityHeight'>
