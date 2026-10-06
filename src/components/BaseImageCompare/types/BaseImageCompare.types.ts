import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления: `default` — скругления и рамка, `ghost` — без рамки и скруглений */
export const IMAGE_COMPARE_VARIANTS = ['default', 'ghost'] as const

/**
 * Части BaseImageCompare для пропа `ui` (БЭМ-элементы `.base-image-compare__<часть>`, `root` — весь компонент):
 * image — картинка «до» и «после», before — слой «до» с обрезкой, label — подписи в углах, track — слой, который
 * сдвигается к границе, divider — линия границы, handle — ручка-ползунок.
 */
export const IMAGE_COMPARE_PARTS = ['image', 'before', 'label', 'track', 'divider', 'handle'] as const

export type BaseImageComparePart = (typeof IMAGE_COMPARE_PARTS)[number]

/**
 * Пропсы компонента BaseImageCompare
 */
export interface BaseImageCompareProps extends BaseComponentProps<(typeof IMAGE_COMPARE_VARIANTS)[number], 'root' | 'handle'> {
	/** Картинка «до»: слева от границы */
	before: string
	/** Картинка «после»: справа от границы */
	after: string
	/** Описание картинки «до» для скринридера */
	beforeAlt: string
	/** Описание картинки «после» для скринридера */
	afterAlt: string
	/** Подпись «до» в углу; по умолчанию «До» */
	beforeLabel?: string
	/** Подпись «после» в углу; по умолчанию «После» */
	afterLabel?: string
	/** Положение границы в процентах от левого края (`v-model:position`) */
	position?: number
	/**
	 * Классы частей (`root`, `before`, `label`, `divider`, `handle`… — см. `IMAGE_COMPARE_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseImageCompare.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseImageCompare :ui="{ root: 'rounded-none', handle: 'shadow-lg' }" />
	 */
	ui?: UiProp<BaseImageComparePart>
}

/**
 * События компонента BaseImageCompare
 */
export interface BaseImageCompareEmits {
	/** Граница сдвинута мышью, пальцем или клавишами */
	(event: 'update:position', value: number): void
}
