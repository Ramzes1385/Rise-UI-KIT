import type { Ref } from 'vue'
import { useInputMask } from './useInputMask'

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

function useMaskedInputHandlers(options: UseMaskedInputHandlersOptions): UseMaskedInputHandlersReturn {
	const mask = useInputMask({ getMask: options.getMask })

	function getRawValue(): string {
		return options.getValue() == null ? '' : String(options.getValue())
	}

	function setCursorPos(pos: number): void {
		requestAnimationFrame(() => {
			/* istanbul ignore next — defensive: inputRef доступен после mount */
			if (options.inputRef.value) {
				options.inputRef.value.setSelectionRange(pos, pos)
			}
		})
	}

	function handleInput(e: Event): void {
		const target = e.target
		if (!(target instanceof HTMLInputElement)) return
		const rawValue = target.value
		const currentMask = options.getMask()

		if (currentMask && !options.isPassword()) {
			const cleanValue = mask.stripMask(rawValue, currentMask)
			const limitedValue = mask.limitValue(cleanValue)

			options.emit('update:modelValue', limitedValue)

			const expectedDisplayValue = mask.applyMask(limitedValue, currentMask)
			if (target.value !== expectedDisplayValue) {
				target.value = expectedDisplayValue
			}

			setCursorPos(mask.cursorAfterInput(limitedValue.length))
		} else {
			options.emit('update:modelValue', rawValue)
		}
	}

	function handleKeydown(e: KeyboardEvent): void {
		options.onKeydown?.(e)
		const currentMask = options.getMask()
		if (!currentMask || options.isPassword()) return

		const target = e.target
		if (!(target instanceof HTMLInputElement)) return
		/* istanbul ignore next -- defensive `?? 0` */
		const cursorPos = target.selectionStart ?? 0
		const current = getRawValue()

		if (e.key === 'Backspace') {
			e.preventDefault()
			if (cursorPos <= 0) return
			const { maskPos, valueIndex } = mask.cursorAfterBackspace(cursorPos)
			/* istanbul ignore else -- DOM clamp boundary */
			if (valueIndex < 0 || valueIndex >= current.length) return
			const newValue = current.slice(0, valueIndex) + current.slice(valueIndex + 1)
			options.emit('update:modelValue', newValue)
			setCursorPos(maskPos)
		}

		if (e.key === 'Delete') {
			e.preventDefault()
			if (cursorPos >= current.length) return
			const { valueIndex } = mask.cursorAfterDelete(cursorPos)
			/* istanbul ignore else -- DOM clamp boundary */
			if (valueIndex < 0 || valueIndex >= current.length) return
			const newValue = current.slice(0, valueIndex) + current.slice(valueIndex + 1)
			options.emit('update:modelValue', newValue)
			setCursorPos(cursorPos)
		}
	}

	return {
		handleInput,
		handleKeydown,
		applyMask: mask.applyMask,
	}
}

export { useMaskedInputHandlers }
