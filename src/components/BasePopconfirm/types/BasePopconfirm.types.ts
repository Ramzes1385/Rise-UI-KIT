import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты панели — те же, что у BaseDropdown и BasePopover */
export const POPCONFIRM_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Сторона от кнопки; у края окна панель переворачивается и сдвигается */
export type PopconfirmPosition = 'top' | 'bottom' | 'left' | 'right'

export interface BasePopconfirmProps extends BaseComponentProps<
	(typeof POPCONFIRM_VARIANTS)[number],
	'root' | 'trigger' | 'panel' | 'title' | 'description' | 'cancel' | 'confirm'
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
