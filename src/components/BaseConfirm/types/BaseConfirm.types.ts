import type { BaseComponentProps } from '@composables/useBaseComponent'
import type { MODAL_VARIANTS } from '@components/BaseModal/types/BaseModal.types'

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
