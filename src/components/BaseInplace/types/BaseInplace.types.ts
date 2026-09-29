import type { Ref } from 'vue'
import type { BaseInput } from '@components/BaseInput'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/** Варианты: default — текст с пунктирным подчёркиванием, наведение — фон; ghost — только текст, наведение — фон */
export const INPLACE_VARIANTS = ['default', 'ghost'] as const

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

export interface BaseInplaceEmits {
	/** Новый текст после сохранения */
	(event: 'update:modelValue', value: string): void
	/** Сохранено (Enter или выход из поля) */
	(event: 'save', value: string): void
	/** Редактирование отменено (Escape) */
	(event: 'cancel'): void
}

export interface BaseInplaceSlots {
	/** Свой вид текста в режиме просмотра */
	display?: (props: { value: string }) => unknown
}

/** Пропсы BaseInplace после значений по умолчанию */
export type InplaceProps = PropsWithDefaults<BaseInplaceProps, 'modelValue' | 'placeholder' | 'isDisabled' | 'isSaveOnBlur'>

/** Состояние правки: режим, текст поля и элементы, между которыми переходит фокус */
export interface InplaceState {
	isEditing: Ref<boolean>
	draft: Ref<string>
	displayRef: Ref<HTMLButtonElement | null>
	inputRef: Ref<InstanceType<typeof BaseInput> | null>
	isControlDisabled: Readonly<Ref<boolean>>
}
