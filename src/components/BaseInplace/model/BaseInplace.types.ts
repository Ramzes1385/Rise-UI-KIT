import type { BaseComponentProps } from '@composables/useBaseComponent'

/** Варианты: default — текст с пунктирным подчёркиванием, наведение — фон; ghost — только текст, наведение — фон */
export const INPLACE_VARIANTS = ['default', 'ghost'] as const

/**
 * Пропсы компонента BaseInplace
 */
export interface BaseInplaceProps extends BaseComponentProps<(typeof INPLACE_VARIANTS)[number], 'root' | 'display' | 'field'> {
	/** Текст (v-model) */
	modelValue?: string
	/** Что редактируется — имя кнопки и поля для скринридера, например «Название проекта» */
	label: string
	/** Текст в пустом значении */
	placeholder?: string
	/** Нельзя редактировать */
	isDisabled?: boolean
	/** Сохранять при выходе из поля (по умолчанию да); иначе выход — отмена */
	isSaveOnBlur?: boolean
}

/**
 * События компонента BaseInplace
 */
export interface BaseInplaceEmits {
	/** Новый текст после сохранения */
	(event: 'update:modelValue', value: string): void
	/** Сохранено (Enter или выход из поля) */
	(event: 'save', value: string): void
	/** Редактирование отменено (Escape) */
	(event: 'cancel'): void
}

/**
 * Слоты компонента BaseInplace
 */
export interface BaseInplaceSlots {
	/** Свой вид текста в режиме просмотра */
	display?: (props: { value: string }) => unknown
}
