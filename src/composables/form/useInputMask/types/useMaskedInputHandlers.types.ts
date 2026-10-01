import type { Ref } from 'vue'
import type { useInputMask } from '../useInputMask'

/** Фильтр допустимых символов для поля без маски */
export type AllowedCharsFilter = 'digits' | 'letters' | 'alphanumeric'

export type UseMaskedInputHandlersOptions = {
	getMask: () => string
	/** Фильтр символов без маски: недопустимые символы не попадают ни в поле, ни в модель */
	getAllowedChars?: () => AllowedCharsFilter | undefined
	getValue: () => string | number | null
	isPassword: () => boolean
	/** Поле недоступно для редактирования (readonly/disabled): обработчики не меняют значение */
	isReadonly?: () => boolean
	emit: (event: 'update:modelValue', value: string) => void
	onKeydown?: (e: KeyboardEvent) => void
	inputRef: Ref<HTMLInputElement | null>
}

export type UseMaskedInputHandlersReturn = {
	handleInput: (e: Event) => void
	handleKeydown: (e: KeyboardEvent) => void
	applyMask: (value: string, mask: string) => string
}

/** Общие данные обработчиков маскированного поля: опции и маска */
export type MaskedInputContext = {
	options: UseMaskedInputHandlersOptions
	mask: ReturnType<typeof useInputMask>
}
