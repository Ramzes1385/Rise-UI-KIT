import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { IMAGE_MAP_ACTIONS } from '@components/BaseImageMap/types/imageMapData.types'
import type { EditorField, EditorFieldOption, EditorFieldSection } from '../../types/imageMapEditorInternal.types'
import type { ImageMapData, ImageMapObject, ImageMapStateStyle } from '@components/BaseImageMap/types/imageMapData.types'

const PERCENT = 100

function toPercent(value: number): number {
	return Math.round(value * PERCENT * 100) / 100
}

function text(key: string, label: string, value: unknown): EditorField {
	return { key, kind: 'text', label, value: typeof value === 'string' ? value : '' }
}

function percentField(key: string, label: string, value: number): EditorField {
	return { key, kind: 'number', label, value: toPercent(value), min: 0, max: PERCENT }
}

function select(field: { key: string; label: string }, value: unknown, options: EditorFieldOption[]): EditorField {
	return { ...field, kind: 'select', value: typeof value === 'string' ? value : '', options }
}

function toggle(key: string, label: string, value: unknown): EditorField {
	return { key, kind: 'switch', label, value: Boolean(value) }
}

function actionOptions(): EditorFieldOption[] {
	const labels: Record<(typeof IMAGE_MAP_ACTIONS)[number], string> = {
		popup: UI_IMAGE_MAP_EDITOR.ACTION_POPUP,
		link: UI_IMAGE_MAP_EDITOR.ACTION_LINK,
		layer: UI_IMAGE_MAP_EDITOR.ACTION_LAYER,
		none: UI_IMAGE_MAP_EDITOR.ACTION_NONE,
	}
	return [
		{ value: '', label: UI_IMAGE_MAP_EDITOR.ACTION_DEFAULT },
		...IMAGE_MAP_ACTIONS.map(action => ({ value: action, label: labels[action] })),
	]
}

function polygonText(points: [number, number][]): string {
	return points.map(([x, y]) => `${toPercent(x)}; ${toPercent(y)}`).join('\n')
}

function geometryFields(object: ImageMapObject): EditorField[] {
	const t = UI_IMAGE_MAP_EDITOR
	if (object.type === 'point') return [percentField('geo.x', t.FIELD_X, object.x), percentField('geo.y', t.FIELD_Y, object.y)]
	if (object.type === 'rect') {
		return [
			percentField('geo.x', t.FIELD_X, object.x),
			percentField('geo.y', t.FIELD_Y, object.y),
			percentField('geo.width', t.FIELD_WIDTH, object.width),
			percentField('geo.height', t.FIELD_HEIGHT, object.height),
		]
	}
	if (object.type === 'ellipse') {
		return [
			percentField('geo.x', t.FIELD_CX, object.x),
			percentField('geo.y', t.FIELD_CY, object.y),
			percentField('geo.rx', t.FIELD_RX, object.rx),
			percentField('geo.ry', t.FIELD_RY, object.ry),
		]
	}
	if (object.type === 'polygon')
		return [{ key: 'geo.points', kind: 'textarea', label: t.FIELD_POINTS, value: polygonText(object.points) }]
	return [{ key: 'elementId', kind: 'text', label: t.FIELD_ELEMENT_ID, value: object.elementId }]
}

function pointFields(object: ImageMapObject): EditorField[] {
	if (object.type !== 'point') return []
	const t = UI_IMAGE_MAP_EDITOR
	return [
		text('label', t.FIELD_LABEL, object.label),
		{ ...text('icon', t.FIELD_ICON, object.icon), placeholder: 'map-pin' },
		{ key: 'size', kind: 'number', label: t.FIELD_SIZE, value: object.size ?? null, min: 8, max: 128, precision: 0 },
		toggle('isScaled', t.FIELD_SCALED, object.isScaled),
		toggle('isPulsing', t.FIELD_PULSING, object.isPulsing),
	]
}

function actionFields(object: ImageMapObject, data: ImageMapData): EditorField[] {
	const t = UI_IMAGE_MAP_EDITOR
	const layers = data.layers.map(layer => ({ value: layer.id, label: layer.title }))
	const fields = [select({ key: 'action', label: t.FIELD_ACTION }, object.action, actionOptions())]
	if (object.action === 'link')
		fields.push(
			{ ...text('link', t.FIELD_LINK, object.link), placeholder: 'https://' },
			toggle('isLinkExternal', t.FIELD_EXTERNAL, object.isLinkExternal),
		)
	if (object.action === 'layer') fields.push(select({ key: 'targetLayer', label: t.FIELD_TARGET_LAYER }, object.targetLayer, layers))
	return fields
}

function styleFields(object: ImageMapObject, data: ImageMapData): EditorField[] {
	const t = UI_IMAGE_MAP_EDITOR
	const named = Object.keys(data.styles ?? {}).map(name => ({ value: name, label: name }))
	const fields = named.length
		? [select({ key: 'styleName', label: t.FIELD_STYLE }, object.style, [{ value: '', label: t.STYLE_OWN }, ...named])]
		: []
	if (typeof object.style === 'string') return fields
	const base: ImageMapStateStyle = object.style?.base ?? {}
	return [
		...fields,
		{ ...text('style.fill', t.FIELD_FILL, base.fill), placeholder: 'var(--rise-primary)' },
		{ ...text('style.stroke', t.FIELD_STROKE, base.stroke), placeholder: 'var(--rise-primary)' },
		{ key: 'style.fillOpacity', kind: 'number', label: t.FIELD_FILL_OPACITY, value: base.fillOpacity ?? null, min: 0, max: 1 },
	]
}

function mainFields(object: ImageMapObject, data: ImageMapData, idError?: string): EditorField[] {
	const t = UI_IMAGE_MAP_EDITOR
	const groups = [{ value: '', label: t.NO_GROUP }, ...(data.groups ?? []).map(group => ({ value: group.id, label: group.title }))]
	const layers = data.layers.map(layer => ({ value: layer.id, label: layer.title }))
	return [
		{ ...text('id', t.FIELD_ID, object.id), error: idError },
		text('title', t.FIELD_TITLE, object.title),
		{ key: 'description', kind: 'textarea', label: t.FIELD_DESCRIPTION, value: object.description ?? '' },
		select({ key: 'group', label: t.FIELD_GROUP }, object.group, groups),
		...(layers.length > 1 && object.type !== 'svg'
			? [select({ key: 'layer', label: t.FIELD_LAYER }, object.layer ?? data.layers[0]?.id, layers)]
			: []),
		{ ...text('image', t.FIELD_IMAGE, object.image), placeholder: 'https://' },
	]
}

function directoryFields(object: ImageMapObject): EditorField[] {
	const t = UI_IMAGE_MAP_EDITOR
	return [
		{ key: 'tags', kind: 'tags', label: t.FIELD_TAGS, value: object.tags ?? [] },
		{ key: 'keywords', kind: 'tags', label: t.FIELD_KEYWORDS, value: object.keywords ?? [] },
		toggle('isHiddenInDirectory', t.FIELD_HIDDEN_IN_DIRECTORY, object.isHiddenInDirectory),
		toggle('isTooltipHidden', t.FIELD_TOOLTIP_HIDDEN, object.isTooltipHidden),
		toggle('isDisabled', t.FIELD_DISABLED, object.isDisabled),
	]
}

export function objectSections(object: ImageMapObject, data: ImageMapData, errors: Record<string, string>): EditorFieldSection[] {
	const t = UI_IMAGE_MAP_EDITOR
	return [
		{ id: 'main', title: t.SECTION_MAIN, fields: mainFields(object, data, errors.id) },
		{
			id: 'geometry',
			title: t.SECTION_GEOMETRY,
			fields: [...geometryFields(object), ...pointFields(object)].map(field => ({ ...field, error: errors[field.key] })),
		},
		{ id: 'action', title: t.SECTION_ACTION, fields: actionFields(object, data) },
		{ id: 'style', title: t.SECTION_STYLE, fields: styleFields(object, data) },
		{ id: 'directory', title: t.SECTION_DIRECTORY, fields: directoryFields(object) },
	]
}
