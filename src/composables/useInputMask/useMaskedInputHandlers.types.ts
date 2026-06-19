import type { Ref } from 'vue'

export type UseMaskedInputHandlersOptions = {
	getMask: () => string
	getValue: () => string | number | null
	isPassword: () => boolean
	emit: (event: 'update:modelValue', value: string) => void
	onKeydown?: (e: KeyboardEvent) => void
	inputRef: Ref<HTMLInputElement | null>
}

export type UseMaskedInputHandlersReturn = {
	handleInput: (e: Event) => void
	handleKeydown: (e: KeyboardEvent) => void
	applyMask: (value: string, mask: string) => string
}
