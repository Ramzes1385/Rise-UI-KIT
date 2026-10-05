import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты панели — те же, что у BaseDropdown и BasePopover */
export const POPCONFIRM_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части для пропа `ui`: root — сам вопрос (`.base-popconfirm`, `role="alertdialog"`), panel — панель, arrow — стрелка,
 * header — строка со значком и вопросом, icon — значок предупреждения, title — вопрос, description — пояснение,
 * actions — кнопки
 */
export const POPCONFIRM_PARTS = ['root', 'panel', 'arrow', 'header', 'icon', 'title', 'description', 'actions'] as const

export type BasePopconfirmPart = (typeof POPCONFIRM_PARTS)[number]

/** Сторона от кнопки; у края окна панель переворачивается и сдвигается */
export type PopconfirmPosition = 'top' | 'bottom' | 'left' | 'right'

export interface BasePopconfirmProps extends BaseComponentProps<
	(typeof POPCONFIRM_VARIANTS)[number],
	'root' | 'trigger' | 'panel' | 'arrow' | 'title' | 'description' | 'cancel' | 'confirm'
> {
	/** Вопрос: имя диалога, например «Удалить серию?» */
	title: string
	/** Пояснение последствий под вопросом */
	description?: string
	/** Текст кнопки подтверждения. По умолчанию «Подтвердить» */
	confirmLabel?: string
	/** Текст кнопки отмены. По умолчанию «Отмена» */
	cancelLabel?: string
	/**
	 * Необратимое действие: кнопка подтверждения цвета ошибки, значок предупреждения,
	 * фокус при открытии — на «Отмене», чтобы случайный Enter ничего не удалил
	 */
	isDanger?: boolean
	/** Открыт ли вопрос (`v-model:is-open`). Без пропа открывается кликом по кнопке */
	isOpen?: boolean
	/** Сторона от кнопки, по умолчанию сверху */
	position?: PopconfirmPosition
	/**
	 * Стрелка к кнопке: показывает, откуда открыт вопрос. У края окна панель переворачивается —
	 * стрелка переходит на другой край; при сдвиге панели остаётся напротив середины кнопки. По умолчанию включена;
	 * у варианта `ghost` стрелки нет, как у BasePopover
	 */
	showArrow?: boolean
	/**
	 * Появление и уход: `scale` (по умолчанию) — масштаб от стрелки, `fade` — прозрачность, `slide` — сдвиг от кнопки,
	 * `pop` — масштаб с пружиной, `none` — сразу. Глобально — `defaults.BasePopconfirm.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей: добавляются к БЭМ-классам кита, глобальные — `defaults.BasePopconfirm.ui`.
	 *
	 * @example
	 * <BasePopconfirm title="Удалить?" :ui="{ root: 'max-w-xs', actions: 'justify-start' }" />
	 */
	ui?: UiProp<BasePopconfirmPart>
}

export interface BasePopconfirmEmits {
	(event: 'update:isOpen', value: boolean): void
	/** Подтвердили */
	(event: 'confirm'): void
	/** Отменили: кнопкой, Escape или кликом снаружи */
	(event: 'cancel'): void
}

export interface PopconfirmTriggerSlotProps {
	/** Вопрос открыт */
	isOpen: boolean
	/** ARIA-атрибуты кнопки; кит ставит их на первую кнопку в слоте сам */
	triggerProps: Record<string, string | undefined>
}

export interface BasePopconfirmSlots {
	/** Кнопка действия, которое нужно подтвердить */
	default?: (props: PopconfirmTriggerSlotProps) => unknown
}

export type PopconfirmProps = PropsWithDefaults<BasePopconfirmProps, 'sizeScale'>
