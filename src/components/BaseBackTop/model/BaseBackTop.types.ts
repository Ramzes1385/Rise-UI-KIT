import type { BaseComponentProps } from '../../../types/base.types'
import type { FabPosition } from '@components/BaseFab'

/** Варианты — как у BaseFab: `default` — заливка основным цветом, `soft` — мягкий цвет, `outline` — фон и рамка */
export const BACK_TOP_VARIANTS = ['default', 'soft', 'outline'] as const

/**
 * Пропсы компонента BaseBackTop.
 * `sizeScale` и `color` — как у BaseFab.
 */
export interface BaseBackTopProps extends BaseComponentProps<(typeof BACK_TOP_VARIANTS)[number], 'root' | 'icon' | 'label'> {
	/** Прокручиваемый контейнер — CSS-селектор или элемент; по умолчанию окно */
	target?: string | HTMLElement
	/** Прокрутка (px), после которой появляется кнопка */
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
}

/**
 * События компонента BaseBackTop
 */
export interface BaseBackTopEmits {
	(event: 'click', value: MouseEvent): void
}
