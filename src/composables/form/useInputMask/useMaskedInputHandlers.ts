/** Composable: обработчики ввода для маскированных полей */
import { nextTick } from 'vue'
import { useInputMask } from './useInputMask'
import type {
	AllowedCharsFilter,
	MaskedInputContext,
	UseMaskedInputHandlersOptions,
	UseMaskedInputHandlersReturn,
} from './types/useMaskedInputHandlers.types'

/** Недопустимые символы для каждого фильтра (\p{L} — буква любого алфавита) */
const DISALLOWED_CHARS: Record<AllowedCharsFilter, RegExp> = {
	digits: /\D/g,
	letters: /[^\p{L}]/gu,
	alphanumeric: /[^\p{L}\d]/gu,
}

function getRawValue(options: UseMaskedInputHandlersOptions): string {
	return options.getValue() == null ? '' : String(options.getValue())
}

/** Маска, которая действует сейчас: у пароля маска не применяется */
function getActiveMask(options: UseMaskedInputHandlersOptions): string {
	const currentMask = options.getMask()
	return currentMask && !options.isPassword() ? currentMask : ''
}

/**
 * Ставит курсор сразу и ещё раз после обновления DOM: v-model может перерисовать поле и сдвинуть курсор в конец.
 * Раньше позиция ставилась в requestAnimationFrame и при быстром вводе срабатывала уже после следующих символов,
 * перенося курсор назад («12ab34» с фильтром цифр давало «1243»). nextTick выполняется до следующего нажатия,
 * и позиция применяется, только если значение поля с тех пор не изменилось.
 */
function setCursorPos(options: UseMaskedInputHandlersOptions, pos: number): void {
	const input = options.inputRef.value
	// selectionStart === null у типов без выделения текста (email, number): setSelectionRange там бросает исключение
	if (!input || input.selectionStart === null) return
	input.setSelectionRange(pos, pos)
	const value = input.value
	nextTick(() => {
		if (input.value === value) input.setSelectionRange(pos, pos)
	})
}

function setFieldValue(target: HTMLInputElement, value: string): void {
	if (target.value !== value) target.value = value
}

function getDisplayValue({ options, mask }: MaskedInputContext): string {
	const currentMask = getActiveMask(options)
	const rawValue = getRawValue(options)
	return currentMask ? mask.applyMask(rawValue, currentMask) : rawValue
}

function applyMaskedInput({ options, mask }: MaskedInputContext, target: HTMLInputElement, currentMask: string): void {
	const limitedValue = mask.limitValue(mask.stripMask(target.value, currentMask))
	options.emit('update:modelValue', limitedValue)
	setFieldValue(target, mask.applyMask(limitedValue, currentMask))
	setCursorPos(options, mask.cursorAfterInput(limitedValue.length))
}

function applyFilteredInput(options: UseMaskedInputHandlersOptions, target: HTMLInputElement): void {
	const rawValue = target.value
	const filter = options.getAllowedChars?.()
	const value = filter ? rawValue.replace(DISALLOWED_CHARS[filter], '') : rawValue
	if (value !== rawValue) {
		// Курсор остаётся там, где был бы без отброшенного символа
		const cursor = Math.max(0, (target.selectionStart ?? value.length) - (rawValue.length - value.length))
		target.value = value
		setCursorPos(options, cursor)
	}
	options.emit('update:modelValue', value)
}

function removeCharAt(value: string, index: number): string {
	return value.slice(0, index) + value.slice(index + 1)
}

function deleteBeforeCursor({ options, mask }: MaskedInputContext, cursorPos: number): void {
	if (cursorPos <= 0) return
	const current = getRawValue(options)
	const { maskPos, valueIndex } = mask.cursorAfterBackspace(cursorPos)
	if (valueIndex < 0 || valueIndex >= current.length) return
	options.emit('update:modelValue', removeCharAt(current, valueIndex))
	setCursorPos(options, maskPos)
}

function deleteAfterCursor({ options, mask }: MaskedInputContext, cursorPos: number): void {
	const current = getRawValue(options)
	if (cursorPos >= current.length) return
	const { valueIndex } = mask.cursorAfterDelete(cursorPos)
	options.emit('update:modelValue', removeCharAt(current, valueIndex))
	setCursorPos(options, cursorPos)
}

function handleInputEvent(context: MaskedInputContext, e: Event): void {
	const target = e.target
	if (!(target instanceof HTMLInputElement)) return
	// Readonly/disabled поле меняет только родитель: не эмитим и возвращаем DOM к текущей модели
	if (context.options.isReadonly?.()) {
		setFieldValue(target, getDisplayValue(context))
		return
	}
	const currentMask = getActiveMask(context.options)
	if (currentMask) applyMaskedInput(context, target, currentMask)
	else applyFilteredInput(context.options, target)
}

function handleKeydownEvent(context: MaskedInputContext, e: KeyboardEvent): void {
	const { options } = context
	options.onKeydown?.(e)
	// Readonly/disabled: не удаляем символы и не отменяем нативное поведение клавиш (выделение, навигация)
	if (!getActiveMask(options) || options.isReadonly?.()) return
	const target = e.target
	if (!(target instanceof HTMLInputElement)) return
	if (e.key !== 'Backspace' && e.key !== 'Delete') return
	e.preventDefault()
	/* istanbul ignore next -- defensive `?? 0` */
	const cursorPos = target.selectionStart ?? 0
	if (e.key === 'Backspace') deleteBeforeCursor(context, cursorPos)
	else deleteAfterCursor(context, cursorPos)
}

/** Обработчики ввода для маскированных полей — применение маски, управление курсором, эмит значений. */
function useMaskedInputHandlers(options: UseMaskedInputHandlersOptions): UseMaskedInputHandlersReturn {
	const mask = useInputMask({ getMask: options.getMask })
	const context: MaskedInputContext = { options, mask }

	return {
		handleInput: (e: Event) => handleInputEvent(context, e),
		handleKeydown: (e: KeyboardEvent) => handleKeydownEvent(context, e),
		applyMask: mask.applyMask,
	}
}

export { useMaskedInputHandlers }
