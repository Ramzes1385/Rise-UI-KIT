import type { CookieCategory } from '../types/BaseCookieConsent.types'

export function normalizeSelection(selected: readonly string[], categories: readonly CookieCategory[]): string[] {
	return categories.filter(category => category.isRequired || selected.includes(category.id)).map(category => category.id)
}

export function allIds(categories: readonly CookieCategory[]): string[] {
	return categories.map(category => category.id)
}

export function isSameSelection(first: readonly string[], second: readonly string[]): boolean {
	return first.length === second.length && first.every((id, index) => id === second[index])
}

export function parseStoredSelection(raw: string | null): string[] | null {
	if (raw === null) return null
	try {
		const value: unknown = JSON.parse(raw)
		return Array.isArray(value) && value.every(id => typeof id === 'string') ? value : null
	} catch {
		return null
	}
}
