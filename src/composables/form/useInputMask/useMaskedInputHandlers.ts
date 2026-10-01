/** Composable: обработчики ввода для маскированных полей */
import { nextTick } from 'vue'
import { useInputMask } from './useInputMask'
import type { AllowedCharsFilter, UseMaskedInputHandlersOptions, UseMaskedInputHandlersReturn } from './types/useMaskedInputHandlers.types'

/** Недопустимые символы для каждого фильтра (\p{L} — буква любого алфавита) */
const DISALLOWED_CHARS: Record<AllowedCharsFilter, RegExp> = {
	digits: /\D/g,
	letters: /[^\p{L}]/gu,
	alphanumeric: /[^\p{L}\d]/gu,
}

/** Обработчики ввода для маскированных полей — применение маски, управление курсором, эмит значений. */
function useMaskedInputHandlers(options: UseMaskedInputHandlersOptions): UseMaskedInputHandlersReturn {
	const mask = useInputMask({ getMask: options.getMask })

	function getRawValue(): string {
		return options.getValue() == null ? '' : String(options.getValue())
	}

	/**
	 * Ставит курсор сразу и ещё раз после обновления DOM: v-model может перерисовать поле и сдвинуть курсор в конец.
	 * Раньше позиция ставилась в requestAnimationFrame и при быстром вводе срабатывала уже после следующих символов,
	 * перенося курсор назад («12ab34» с фильтром цифр давало «1243»). nextTick выполняется до следующего нажатия,
	 * и позиция применяется, только если значение поля с тех пор не изменилось.
	 */
	function setCursorPos(pos: number): void {
		const input = options.inputRef.value
		// selectionStart === null у типов без выделения текста (email, number): setSelectionRange там бросает исключение
		if (!input || input.selectionStart === null) return
		input.setSelectionRange(pos, pos)
		const value = input.value
		nextTick(() => {
			if (input.value === value) input.setSelectionRange(pos, pos)
		})
	}

	function getDisplayValue(): string {
		const currentMask = options.getMask()
		const rawValue = getRawValue()
		return currentMask && !options.isPassword() ? mask.applyMask(rawValue, currentMask) : rawValue
	}

	function handleInput(e: Event): void {
		const target = e.target
		if (!(target instanceof HTMLInputElement)) return
		// Readonly/disabled поле меняет только родитель: не эмитим и возвращаем DOM к текущей модели
		if (options.isReadonly?.()) {
			const displayValue = getDisplayValue()
			if (target.value !== displayValue) target.value = displayValue
			return
		}
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
			const filter = options.getAllowedChars?.()
			const value = filter ? rawValue.replace(DISALLOWED_CHARS[filter], '') : rawValue
			if (value !== rawValue) {
				// Курсор остаётся там, где был бы без отброшенного символа
				const cursor = Math.max(0, (target.selectionStart ?? value.length) - (rawValue.length - value.length))
				target.value = value
				setCursorPos(cursor)
			}
			options.emit('update:modelValue', value)
		}
	}

	function handleKeydown(e: KeyboardEvent): void {
		options.onKeydown?.(e)
		const currentMask = options.getMask()
		// Readonly/disabled: не удаляем символы и не отменяем нативное поведение клавиш (выделение, навигация)
		if (!currentMask || options.isPassword() || options.isReadonly?.()) return

		const target = e.target
		if (!(target instanceof HTMLInputElement)) return
		/* istanbul ignore next -- defensive `?? 0` */
		const cursorPos = target.selectionStart ?? 0
		const current = getRawValue()

		if (e.key === 'Backspace') {
			e.preventDefault()
			if (cursorPos <= 0) return
			const { maskPos, valueIndex } = mask.cursorAfterBackspace(cursorPos)
			if (valueIndex < 0 || valueIndex >= current.length) return
			const newValue = current.slice(0, valueIndex) + current.slice(valueIndex + 1)
			options.emit('update:modelValue', newValue)
			setCursorPos(maskPos)
		}

		if (e.key === 'Delete') {
			e.preventDefault()
			if (cursorPos >= current.length) return
			const { valueIndex } = mask.cursorAfterDelete(cursorPos)
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
