/** Composable: ARIA-атрибуты на элементе-триггере из слота (кнопка внутри обёртки компонента) */
import { onBeforeUnmount, onMounted, onUpdated, ref, useId, watch } from 'vue'
import type { Ref } from 'vue'

/** Значение атрибута; `undefined` — атрибута нет */
export type TriggerAttributes = Record<string, string | undefined>

/**
 * Фокусируемые элементы: триггером считается первый из них внутри обёртки. Ссылки — только `a` и `area`:
 * `[href]` есть и у `<use>` в SVG-иконке перед полем или кнопкой
 */
const FOCUSABLE_SELECTOR = 'button, a[href], area[href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'

/** Атрибуты со списком id через пробел: компонент добавляет и убирает свой id, не трогая чужие */
const TOKEN_ATTRIBUTES = new Set(['aria-describedby'])

function toTokens(value: string | null): string[] {
	return value ? value.split(/\s+/).filter(Boolean) : []
}

/** Добавить или убрать свой id в списке, остальные id остаются */
function updateTokens(element: Element, name: string, previous: string | undefined, next: string | undefined): void {
	const tokens = toTokens(element.getAttribute(name)).filter(token => token !== previous)
	if (next && !tokens.includes(next)) tokens.push(next)
	if (tokens.length) element.setAttribute(name, tokens.join(' '))
	else element.removeAttribute(name)
}

/**
 * Ставит атрибуты (`aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-describedby`…) на элемент-триггер
 * внутри обёртки: первый фокусируемый элемент, иначе первый дочерний. Так кнопка приложения в слоте получает
 * ARIA-связь с панелью без обёрток и без `v-bind` в шаблоне. Атрибуты обновляются при их изменении
 * и после каждой перерисовки компонента; при размонтировании снимаются.
 *
 * `withId: true` — триггеру нужен id (панель называется по нему через `aria-labelledby`): без своего id
 * элемент получает сгенерированный. `triggerId` — id триггера.
 *
 * @example
 * const { triggerId } = useTriggerAttributes(() => triggerRef.value, () => ({
 *   'aria-haspopup': 'dialog',
 *   'aria-expanded': String(isOpen.value),
 * }), { withId: true })
 */
export function useTriggerAttributes(
	getContainer: () => HTMLElement | null | undefined,
	getAttributes: () => TriggerAttributes,
	options: { withId?: boolean } = {},
): { triggerId: Ref<string | undefined>; getTrigger: () => HTMLElement | null } {
	const generatedId = `rise-trigger-${useId()}`
	const triggerId = ref<string | undefined>()
	let applied: { element: HTMLElement; attributes: TriggerAttributes; ownId: boolean } | null = null

	function getTrigger(): HTMLElement | null {
		const container = getContainer()
		if (!container) return null
		return container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? (container.firstElementChild as HTMLElement | null)
	}

	function remove(target: NonNullable<typeof applied>): void {
		for (const [name, value] of Object.entries(target.attributes)) {
			if (TOKEN_ATTRIBUTES.has(name)) updateTokens(target.element, name, value, undefined)
			else target.element.removeAttribute(name)
		}
		if (target.ownId) target.element.removeAttribute('id')
	}

	function apply(): void {
		const element = getTrigger()
		if (applied && applied.element !== element) {
			remove(applied)
			applied = null
		}
		if (!element) {
			triggerId.value = undefined
			return
		}

		const attributes = getAttributes()
		const previous = applied?.attributes ?? {}
		for (const [name, value] of Object.entries(attributes)) {
			if (TOKEN_ATTRIBUTES.has(name)) updateTokens(element, name, previous[name], value)
			else if (value === undefined) element.removeAttribute(name)
			else element.setAttribute(name, value)
		}

		const ownId = applied?.ownId ?? (Boolean(options.withId) && !element.id)
		if (ownId) element.id = generatedId
		triggerId.value = element.id || undefined
		applied = { element, attributes, ownId }
	}

	watch(getAttributes, apply, { flush: 'post' })
	onMounted(apply)
	onUpdated(apply)
	onBeforeUnmount(() => {
		if (applied) remove(applied)
		applied = null
	})

	return { triggerId, getTrigger }
}
