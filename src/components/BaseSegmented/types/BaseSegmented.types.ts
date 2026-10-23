import type { UiClassFn, UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты оформления:
 * default — дорожка bg-elevated, выбранный сегмент — фон страницы с тенью;
 * soft — выбранный сегмент в мягком основном цвете; outline — дорожка с рамкой, выбранный сегмент с рамкой основного цвета
 */
export const SEGMENTED_VARIANTS = ['default', 'soft', 'outline'] as const

/**
 * Части для пропа `ui` (БЭМ-элементы `.base-segmented__<часть>`, `root` — корень): label — заголовок, track — дорожка,
 * indicator — подложка выбранного сегмента (один элемент на дорожку, переезжает при выборе), segment — `<label>` сегмента,
 * input — нативный radio, icon — иконка, text — подпись сегмента, error — текст ошибки.
 */
export const SEGMENTED_PARTS = ['label', 'track', 'indicator', 'segment', 'input', 'icon', 'text', 'error'] as const

export type BaseSegmentedPart = (typeof SEGMENTED_PARTS)[number]

export interface SegmentedOption {
	/** Значение: уходит в v-model при выборе */
	value: string | number
	/** Подпись сегмента */
	label: string
	/** Иконка перед подписью */
	icon?: string
	/** Сегмент нельзя выбрать */
	isDisabled?: boolean
}

export interface BaseSegmentedProps extends BaseComponentProps<
	(typeof SEGMENTED_VARIANTS)[number],
	'root' | 'label' | 'track' | 'segment' | 'error'
> {
	/** Выбранное значение (v-model) */
	modelValue?: string | number | null
	/** Сегменты */
	options: SegmentedOption[]
	/** Заголовок группы — её имя для скринридера */
	label?: string
	/** Имя группы без видимого заголовка */
	ariaLabel?: string
	/** Имя нативных radio (по умолчанию уникальное) */
	name?: string
	/** Отключает все сегменты */
	isDisabled?: boolean
	/** Во всю ширину: сегменты делят её поровну */
	isBlock?: boolean
	/**
	 * Только иконки: подпись сегмента с иконкой скрыта визуально, но остаётся его доступным именем, а при наведении
	 * и фокусе показывается подсказкой (BaseTooltip). Сегмент без иконки остаётся с видимой подписью.
	 */
	isIconOnly?: boolean
	/** Текст ошибки под группой */
	error?: string
	/**
	 * Классы частей (`root`, `track`, `indicator`, `segment`… — см. `SEGMENTED_PARTS`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseSegmented: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseSegmented v-model="period" :options="periods" :ui="{ track: 'rounded-full', indicator: 'rounded-full' }" />
	 */
	ui?: UiProp<BaseSegmentedPart>
}

export interface BaseSegmentedEmits {
	/** Выбран сегмент (кликом, стрелками или пробелом) */
	(event: 'update:modelValue', value: string | number): void
	/** То же после действия пользователя */
	(event: 'change', value: string | number): void
}

/** Пропсы сегмента (внутренний компонент) */
export interface SegmentedItemProps {
	/** Сегмент */
	option: SegmentedOption
	/** Сегмент выбран */
	isChecked: boolean
	/** Сегмент отключён */
	isDisabled: boolean
	/** Подпись скрыта: у сегмента есть иконка и включён `isIconOnly` */
	isIconOnly: boolean
	/** Имя нативных radio группы */
	name: string
	/** Классы частей (проп `ui`) */
	ui: UiClassFn<BaseSegmentedPart>
	/** Класс сегмента из `customClass.segment` */
	customClass?: string
	/** Масштаб размера в процентах */
	sizeScale: number
}

/** События сегмента (внутренний компонент) */
export interface SegmentedItemEmits {
	/** Сегмент выбран */
	(event: 'select', value: string | number): void
}
