import type { UiProp } from '@composables/base/useUi'
import type { EnterAnimation } from '@composables/app/useMotion'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { MODAL_VARIANTS } from '@components/BaseModal/types/BaseModal.types'

/**
 * Части окна подтверждения для пропа `ui`: root — само окно (класс `base-confirm` на окне BaseModal), description — пояснение,
 * cancel — кнопка отмены, confirm — кнопка подтверждения. Затемнение, шапку и подвал оформляют части BaseModal.
 */
export const CONFIRM_PARTS = ['root', 'description', 'cancel', 'confirm'] as const

export type BaseConfirmPart = (typeof CONFIRM_PARTS)[number]

export interface BaseConfirmProps extends BaseComponentProps<
	(typeof MODAL_VARIANTS)[number],
	'root' | 'description' | 'cancel' | 'confirm'
> {
	/** Открыто ли окно (v-model:is-open) */
	isOpen: boolean
	/** Вопрос: доступное имя окна, например «Удалить проект?» */
	title: string
	/** Пояснение последствий под заголовком: скринридер читает его вместе с заголовком */
	description?: string
	/** Текст кнопки подтверждения. По умолчанию «Подтвердить» */
	confirmLabel?: string
	/** Текст кнопки отмены. По умолчанию «Отмена» */
	cancelLabel?: string
	/**
	 * Необратимое действие (удаление, отзыв доступа): кнопка подтверждения окрашена цветом ошибки,
	 * а фокус при открытии стоит на «Отмене», чтобы случайный Enter ничего не удалил
	 */
	isDanger?: boolean
	/**
	 * Появление и уход окна — проп `animation` BaseModal: `scale` (по умолчанию), `fade`, `slide`, `pop`, `none`.
	 * Глобально — `defaults.BaseConfirm.animation` или `defaults.global.animation`
	 */
	animation?: EnterAnimation
	/**
	 * Классы частей окна подтверждения: добавляются к БЭМ-классам кита, глобальные — `defaults.BaseConfirm.ui`.
	 *
	 * @example
	 * <BaseConfirm :ui="{ root: 'max-w-sm', confirm: 'min-w-32' }" />
	 */
	ui?: UiProp<BaseConfirmPart>
}

export interface BaseConfirmEmits {
	/** Результат: true — подтвердили, false — отменили (кнопкой, Escape, крестиком или кликом по фону) */
	(event: 'close', result: boolean): void
	(event: 'update:isOpen', value: boolean): void
	(event: 'confirm'): void
	(event: 'cancel'): void
	/** Окно закрыто и анимация закрытия закончилась */
	(event: 'after-leave'): void
}

/** Параметры `useConfirm()` */
export type ConfirmOptions = Omit<BaseConfirmProps, 'isOpen' | 'customClass'>
