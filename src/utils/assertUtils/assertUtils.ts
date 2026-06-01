/**
 * Утверждает, что значение определено (не null и не undefined).
 *
 * Используется как замена рутинной проверке `if (!value) return` там, где значение —
 * гарантированный invariant после mount/setup. Бросает `TypeError` с понятным сообщением
 * в случае нарушения.
 *
 * @param value - проверяемое значение
 * @param name - опциональное имя для сообщения об ошибке (по умолчанию 'value')
 *
 * @example
 * const ref = useTemplateRef<HTMLElement>('input')
 * onMounted(() => {
 *   assertDefined(ref.value, 'inputRef')
 *   ref.value.focus()
 * })
 */
function assertDefined<T>(value: T | null | undefined, name?: string): asserts value is T {
	if (value === null || value === undefined) {
		throw new TypeError(`assertDefined: ${name ?? 'value'} is ${String(value)}`)
	}
}

export { assertDefined }
