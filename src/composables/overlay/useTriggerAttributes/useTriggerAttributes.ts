import type { Ref } from 'vue'
/** Composable: ARIA-атрибуты на элементе-триггере из слота (кнопка внутри обёртки компонента) */
import { onBeforeUnmount, onMounted, onUpdated, ref, useId, watch } from 'vue'
import type { TriggerAttributes, UseTriggerAttributesOptions } from './types/useTriggerAttributes.types'

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

/** Добавить или убрать свой id в списке, остальные id остаются: `previous` убирается, `next` добавляется */
function updateTokens(element: Element, name: string, change: { previous?: string; next?: string }): void {
	const tokens = toTokens(element.getAttribute(name)).filter(token => token !== change.previous)
	if (change.next && !tokens.includes(change.next)) tokens.push(change.next)
	if (tokens.length) element.setAttribute(name, tokens.join(' '))
	else element.removeAttribute(name)
}

/** Записать атрибуты на триггер: в списках id `previous` заменяется новым значением, `undefined` снимает атрибут */
function writeAttributes(element: HTMLElement, attributes: TriggerAttributes, previous: TriggerAttributes): void {
	for (const [name, value] of Object.entries(attributes)) {
		if (TOKEN_ATTRIBUTES.has(name)) updateTokens(element, name, { previous: previous[name], next: value })
		else if (value === undefined) element.removeAttribute(name)
		else element.setAttribute(name, value)
	}
}

/** Снять с триггера поставленные атрибуты: из списков id — только свои значения; id — если его выдал composable */
function removeAttributes(element: HTMLElement, attributes: TriggerAttributes, ownId: boolean): void {
	for (const [name, value] of Object.entries(attributes)) {
		if (TOKEN_ATTRIBUTES.has(name)) updateTokens(element, name, { previous: value })
		else element.removeAttribute(name)
	}
	if (ownId) element.removeAttribute('id')
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
 * `fallbackAttributes` — атрибуты для триггера, в котором нет фокусируемого элемента (в слоте `span` или `div`):
 * `{ role: 'button', tabindex: '0' }` делает его доступным с клавиатуры. `isFallbackTrigger()` — сейчас так.
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
	options: UseTriggerAttributesOptions = {},
): { triggerId: Ref<string | undefined>; getTrigger: () => HTMLElement | null; isFallbackTrigger: () => boolean } {
	const generatedId = `rise-trigger-${useId()}`
	const triggerId = ref<string | undefined>()
	let applied: { element: HTMLElement; attributes: TriggerAttributes; ownId: boolean; isFallback: boolean } | null = null

	function getTrigger(): HTMLElement | null {
		const container = getContainer()
		if (!container) return null
		return container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? (container.firstElementChild as HTMLElement | null)
	}

	/** Снять атрибуты с прежнего триггера, если триггер сменился или пропал (`element` — текущий триггер) */
	function release(element: HTMLElement | null): void {
		if (!applied || applied.element === element) return
		removeAttributes(applied.element, applied.attributes, applied.ownId)
		applied = null
	}

	/** Триггер без фокусируемого элемента: решение принимается один раз, свой `tabindex` его не меняет */
	function isFallbackElement(element: HTMLElement): boolean {
		if (applied) return applied.isFallback
		return Boolean(options.fallbackAttributes) && !element.matches(FOCUSABLE_SELECTOR)
	}

	function apply(): void {
		const element = getTrigger()
		release(element)
		if (!element) {
			triggerId.value = undefined
			return
		}

		const isFallback = isFallbackElement(element)
		const attributes = isFallback ? { ...getAttributes(), ...options.fallbackAttributes } : getAttributes()
		writeAttributes(element, attributes, applied?.attributes ?? {})

		const ownId = applied?.ownId ?? (Boolean(options.withId) && !element.id)
		if (ownId) element.id = generatedId
		triggerId.value = element.id || undefined
		applied = { element, attributes, ownId, isFallback }
	}

	watch(getAttributes, apply, { flush: 'post' })
	onMounted(apply)
	onUpdated(apply)
	onBeforeUnmount(() => release(null))

	return { triggerId, getTrigger, isFallbackTrigger: () => Boolean(applied?.isFallback) }
}
