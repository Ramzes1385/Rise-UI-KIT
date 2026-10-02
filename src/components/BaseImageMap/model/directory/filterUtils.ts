import { UI_IMAGE_MAP } from '@/locales/messages'
import { foldSearchText } from '@utils/data/textUtils'
import type { ImageMapFilterValues } from '../../types/BaseImageMap.types'
import { IMAGE_MAP_OPEN_NOW_VALUE } from '../../types/ImageMapHours.types'
import type { ResolvedImageMapObject } from '../../types/imageMapModel.types'
import type { ImageMapData, ImageMapFilter, ImageMapFilterOption, ImageMapObject } from '../../types/imageMapData.types'

export function normalizeText(value: string): string {
	return foldSearchText(value).replace(/\s+/g, ' ').trim()
}

export function filterOptions(filter: ImageMapFilter, data: ImageMapData): ImageMapFilterOption[] {
	if (filter.type === 'open-now') return [{ value: IMAGE_MAP_OPEN_NOW_VALUE, label: UI_IMAGE_MAP.OPEN_NOW }]
	if (filter.options) return filter.options
	return (data.groups ?? []).map(group => ({ value: group.id, label: group.title }))
}

function objectValues(object: ImageMapObject, filter: ImageMapFilter): string[] {
	if (filter.options) return object.tags ?? []
	return object.group ? [object.group] : []
}

function matchesFilter(object: ImageMapObject, filter: ImageMapFilter, selected: string[] | undefined): boolean {
	if (!selected?.length) return true
	const values = objectValues(object, filter)
	if (filter.logic === 'and' && filter.type !== 'select') return selected.every(value => values.includes(value))
	return selected.some(value => values.includes(value))
}

export function matchesFilters(object: ImageMapObject, filters: ImageMapFilter[], values: ImageMapFilterValues): boolean {
	return filters.every(filter => filter.type === 'open-now' || matchesFilter(object, filter, values[filter.id]))
}

export function initialFilterValues(filters: ImageMapFilter[]): ImageMapFilterValues {
	return Object.fromEntries(
		filters.flatMap((filter): [string, string[]][] => (filter.value?.length ? [[filter.id, [...filter.value]]] : [])),
	)
}

export function searchText(item: ResolvedImageMapObject): string {
	const { title, description, keywords } = item.object
	return normalizeText([title, description, item.group?.title, ...(keywords ?? [])].filter(Boolean).join(' '))
}

export function matchesSearch(text: string, query: string): boolean {
	const words = normalizeText(query).split(' ').filter(Boolean)
	return words.every(word => text.includes(word))
}
