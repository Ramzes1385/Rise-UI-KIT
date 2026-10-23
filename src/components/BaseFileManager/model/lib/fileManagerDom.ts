export const ENTRY_SELECTOR = '[data-entry-id]'

export function entryIdOf(target: EventTarget | null): string | null {
	const element = target instanceof Element ? target.closest(ENTRY_SELECTOR) : null
	return element?.getAttribute('data-entry-id') ?? null
}
