import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты оформления: `default` — скругления и рамка, `ghost` — без рамки и скруглений */
export const IMAGE_COMPARE_VARIANTS = ['default', 'ghost'] as const

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
}

/**
 * События компонента BaseImageCompare
 */
export interface BaseImageCompareEmits {
	/** Граница сдвинута мышью, пальцем или клавишами */
	(event: 'update:position', value: number): void
}
