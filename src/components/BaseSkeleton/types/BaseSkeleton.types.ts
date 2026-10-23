import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Части скелетона для пропа `ui`: своих БЭМ-элементов нет — только `root` (сам блок-заглушка).
 */
export const SKELETON_PARTS = [] as const

export type BaseSkeletonPart = (typeof SKELETON_PARTS)[number]

export interface BaseSkeletonProps extends Omit<BaseComponentProps<string, 'root'>, 'color'> {
	/**
	 * Ширина: число — пиксели (0 и больше), строка — любая длина CSS (`'100%'`, `'12rem'`). Масштабируется `sizeScale`;
	 * ключевые слова (`'auto'`, `'fit-content'`) — без масштаба. Отрицательное число и NaN не применяются.
	 */
	width?: string | number
	/**
	 * Высота: число — пиксели, строка — любая длина CSS, правила те же, что у `width`. У `text` по умолчанию 16px;
	 * `circle` без высоты — квадрат по ширине; `rect` без высоты не виден (растягивается только во flex и grid).
	 */
	height?: string | number
	/** Форма: `text` — строка текста, `rect` — блок со скруглением, `circle` — квадрат со скруглением аватара (заглушка аватара). */
	shape?: 'text' | 'circle' | 'rect'
	/** Полоса-шиммер (по умолчанию включена). Отключается при системной настройке «уменьшить движение». */
	isAnimated?: boolean
	/** Свой цвет фона вместо `--rise-bg-elevated` (любой цвет CSS, например токен `var(--rise-primary-soft)`). */
	color?: string
	/** Мерцание прозрачностью. Отключается при системной настройке «уменьшить движение». */
	isPulse?: boolean
	/**
	 * Классы частей скелетона (`root`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseSkeleton: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseSkeleton shape="text" width="60%" :ui="{ root: 'my-skeleton' }" />
	 */
	ui?: UiProp<BaseSkeletonPart>
}

export type BaseSkeletonEmits = Record<string, never>

/** Слотов нет: содержимое строится из props */
export type BaseSkeletonSlots = Record<never, never>

export type SkeletonProps = PropsWithDefaults<BaseSkeletonProps, 'sizeScale'>
