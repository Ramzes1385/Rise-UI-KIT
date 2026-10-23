import type { BaseSelectOption } from '../types/BaseSelect.types'

export const GENRES: BaseSelectOption[] = [
	{ value: 'drama', label: 'Драма' },
	{ value: 'comedy', label: 'Комедия' },
	{ value: 'fantasy', label: 'Фэнтези' },
	{ value: 'detective', label: 'Детектив' },
	{ value: 'romance', label: 'Романтика' },
	{ value: 'history', label: 'Исторический' },
]

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
