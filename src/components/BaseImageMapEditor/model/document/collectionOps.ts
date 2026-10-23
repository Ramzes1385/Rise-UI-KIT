import { createId } from './editorOps'
import type { EditorRowPath } from '../../types/imageMapEditorInternal.types'
import type {
	ImageMapData,
	ImageMapFilter,
	ImageMapFilterOption,
	ImageMapStateStyle,
} from '@components/BaseImageMap/types/imageMapData.types'

function setOrDelete(target: object, key: string, value: unknown): void {
	const record = target as Record<string, unknown>
	if (value === undefined || value === '' || value === null) delete record[key]
	else record[key] = value
}

export function addFilter(data: ImageMapData, title: string): ImageMapFilter {
	data.filters ??= []
	const filter: ImageMapFilter = {
		id: createId(
			'filter',
			data.filters.map(item => item.id),
		),
		title,
	}
	data.filters.push(filter)
	return filter
}

export function patchFilter(data: ImageMapData, index: number, patch: Partial<ImageMapFilter>): void {
	const filter = data.filters?.[index]
	if (!filter) return
	for (const [key, value] of Object.entries(patch)) setOrDelete(filter, key, value)
	if (filter.type === 'open-now') delete filter.options
}

export function removeFilter(data: ImageMapData, index: number): void {
	data.filters?.splice(index, 1)
	if (!data.filters?.length) delete data.filters
}

export function addFilterOption(data: ImageMapData, index: number, label: string): void {
	const filter = data.filters?.[index]
	if (!filter) return
	filter.options ??= []
	const value = createId(
		'option',
		filter.options.map(item => item.value),
	)
	filter.options.push({ value, label })
}

export function patchFilterOption(data: ImageMapData, at: EditorRowPath, patch: Partial<ImageMapFilterOption>): void {
	const filter = data.filters?.[at.index]
	const option = filter?.options?.[at.child]
	if (!filter || !option) return
	const previous = option.value
	Object.assign(option, patch)
	if (patch.value !== undefined && filter.value?.includes(previous))
		filter.value = filter.value.map(item => (item === previous ? option.value : item))
}

function dropSelected(filter: ImageMapFilter, value: string): void {
	const rest = (filter.value ?? []).filter(item => item !== value)
	if (rest.length) filter.value = rest
	else delete filter.value
}

export function removeFilterOption(data: ImageMapData, index: number, child: number): void {
	const filter = data.filters?.[index]
	const [removed] = filter?.options?.splice(child, 1) ?? []
	if (!filter || !removed) return
	if (!filter.options?.length) delete filter.options
	dropSelected(filter, removed.value)
}

export function addStyle(data: ImageMapData, name: string): void {
	data.styles ??= {}
	data.styles[name] = { base: {} }
}

export function patchStyleBase(data: ImageMapData, name: string, change: { key: keyof ImageMapStateStyle; value: unknown }): void {
	const style = data.styles?.[name]
	if (!style) return
	const base: ImageMapStateStyle = { ...style.base }
	setOrDelete(base, change.key, change.value)
	if (Object.keys(base).length) style.base = base
	else delete style.base
}

function relinkStyle(data: ImageMapData, from: string, to: string | undefined): void {
	for (const holder of [...data.objects, ...(data.groups ?? [])]) {
		if (holder.style !== from) continue
		if (to === undefined) delete holder.style
		else holder.style = to
	}
}

export function renameStyle(data: ImageMapData, from: string, to: string): void {
	if (!data.styles || from === to || !(from in data.styles)) return
	data.styles = Object.fromEntries(Object.entries(data.styles).map(([name, style]) => [name === from ? to : name, style]))
	relinkStyle(data, from, to)
}

export function removeStyle(data: ImageMapData, name: string): void {
	if (!data.styles) return
	delete data.styles[name]
	relinkStyle(data, name, undefined)
	if (!Object.keys(data.styles).length) delete data.styles
}
