import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import type { EditorField } from '../../types/imageMapEditorInternal.types'
import type { ImageMapData, ImageMapGroup, ImageMapLayer } from '@components/BaseImageMap/types/imageMapData.types'

function text(key: string, label: string, value: string | undefined): EditorField {
	return { key, kind: 'text', label, value: value ?? '' }
}

export function layerFields(layer: ImageMapLayer): EditorField[] {
	const t = UI_IMAGE_MAP_EDITOR
	const fields: EditorField[] = [
		text('title', t.FIELD_LAYER_TITLE, layer.title),
		{ ...text('shortTitle', t.FIELD_SHORT_TITLE, layer.shortTitle), placeholder: '1' },
	]
	if (!layer.svg)
		fields.push({ ...text('image', t.FIELD_IMAGE_URL, layer.image?.startsWith('data:') ? '' : layer.image), placeholder: 'https://' })
	if (layer.svgUrl) fields.push(text('svgUrl', t.FIELD_SVG_URL, layer.svgUrl))
	return [
		...fields,
		text('imageAlt', t.FIELD_IMAGE_ALT, layer.imageAlt),
		{ key: 'width', kind: 'number', label: t.FIELD_LAYER_WIDTH, value: layer.width, min: 1, precision: 0 },
		{ key: 'height', kind: 'number', label: t.FIELD_LAYER_HEIGHT, value: layer.height, min: 1, precision: 0 },
	]
}

function groupStyleFields(group: ImageMapGroup, data: ImageMapData): EditorField[] {
	const names = Object.keys(data.styles ?? {})
	if (!names.length) return []
	const t = UI_IMAGE_MAP_EDITOR
	const options = [{ value: '', label: t.STYLE_NONE }, ...names.map(name => ({ value: name, label: name }))]
	return [{ key: 'style', kind: 'select', label: t.FIELD_STYLE, value: group.style ?? '', options }]
}

export function groupFields(group: ImageMapGroup, data: ImageMapData): EditorField[] {
	const t = UI_IMAGE_MAP_EDITOR
	return [
		text('title', t.FIELD_GROUP_TITLE, group.title),
		{ ...text('color', t.FIELD_COLOR, group.color), placeholder: 'var(--rise-primary)' },
		{ ...text('icon', t.FIELD_ICON, group.icon), placeholder: 'map-pin' },
		...groupStyleFields(group, data),
	]
}
