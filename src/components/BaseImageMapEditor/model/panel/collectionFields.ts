import { formatMessage } from '@/locales/state'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { IMAGE_MAP_FILTER_LOGIC, IMAGE_MAP_FILTER_TYPES } from '@components/BaseImageMap/types/imageMapData.types'
import type { ImageMapData, ImageMapFilter, ImageMapStateStyle } from '@components/BaseImageMap/types/imageMapData.types'
import type {
	EditorField,
	EditorFieldOption,
	EditorFieldValue as FieldValue,
	EditorListRow,
	EditorRowPath,
} from '../../types/imageMapEditorInternal.types'

const t = UI_IMAGE_MAP_EDITOR

const STYLE_KEYS = ['fill', 'stroke', 'strokeWidth', 'fillOpacity'] as const

function colorOptions(): EditorFieldOption[] {
	return [
		{ value: '', label: t.COLOR_CUSTOM },
		{ value: 'var(--rise-primary)', label: t.COLOR_PRIMARY },
		{ value: 'var(--rise-success)', label: t.COLOR_SUCCESS },
		{ value: 'var(--rise-info)', label: t.COLOR_INFO },
		{ value: 'var(--rise-warning)', label: t.COLOR_WARNING },
		{ value: 'var(--rise-error)', label: t.COLOR_ERROR },
		{ value: 'var(--rise-text)', label: t.COLOR_TEXT },
		{ value: 'var(--rise-border-accented)', label: t.COLOR_BORDER },
		{ value: 'var(--rise-bg-accented)', label: t.COLOR_BACKGROUND },
	]
}

function typeOptions(): EditorFieldOption[] {
	const labels: Record<(typeof IMAGE_MAP_FILTER_TYPES)[number], string> = {
		checkbox: t.FILTER_TYPE_CHECKBOX,
		tags: t.FILTER_TYPE_TAGS,
		select: t.FILTER_TYPE_SELECT,
		switch: t.FILTER_TYPE_SWITCH,
		'open-now': t.FILTER_TYPE_OPEN_NOW,
	}
	return IMAGE_MAP_FILTER_TYPES.map(value => ({ value, label: labels[value] }))
}

function logicOptions(): EditorFieldOption[] {
	const labels: Record<(typeof IMAGE_MAP_FILTER_LOGIC)[number], string> = { or: t.LOGIC_OR, and: t.LOGIC_AND }
	return IMAGE_MAP_FILTER_LOGIC.map(value => ({ value, label: labels[value] }))
}

function text(field: { key: string; label: string }, value: string | undefined, error: string | undefined): EditorField {
	return { ...field, kind: 'text', value: value ?? '', error, isTrimmedOnBlur: true }
}

function choice(field: { key: string; label: string }, value: string, options: EditorFieldOption[]): EditorField {
	return { ...field, kind: 'select', value, options }
}

function optionRows(filter: ImageMapFilter, index: number, errors: Record<string, string>): EditorListRow[] {
	return (filter.options ?? []).map((option, child) => ({
		title: option.label || option.value,
		deleteLabel: formatMessage(t.DELETE_FILTER_OPTION, { title: option.label || option.value }),
		fields: [
			text({ key: 'value', label: t.FIELD_OPTION_VALUE }, option.value, errors[`${index}.${child}.value`]),
			text({ key: 'label', label: t.FIELD_OPTION_LABEL }, option.label, errors[`${index}.${child}.label`]),
		],
	}))
}

export function filterRows(data: ImageMapData, errors: Record<string, string>): EditorListRow[] {
	return (data.filters ?? []).map((filter, index) => {
		const hasOptions = filter.type !== 'open-now'
		const logic = hasOptions ? [choice({ key: 'logic', label: t.FIELD_FILTER_LOGIC }, filter.logic ?? 'or', logicOptions())] : []
		return {
			title: filter.title,
			deleteLabel: formatMessage(t.DELETE_FILTER, { title: filter.title }),
			fields: [
				text({ key: 'id', label: t.FIELD_FILTER_ID }, filter.id, errors[`${index}.id`]),
				text({ key: 'title', label: t.FIELD_FILTER_TITLE }, filter.title, errors[`${index}.title`]),
				choice({ key: 'type', label: t.FIELD_FILTER_TYPE }, filter.type ?? 'checkbox', typeOptions()),
				...logic,
			],
			...(hasOptions && {
				children: optionRows(filter, index, errors),
				childrenTitle: formatMessage(t.FILTER_OPTIONS, { title: filter.title }),
				addChildLabel: t.ADD_FILTER_OPTION,
				hint: filter.options?.length ? undefined : t.FILTER_BY_GROUPS,
			}),
		}
	})
}

function colorField(key: string, label: string, value: string | undefined): EditorField {
	return { key, kind: 'color', label, value: value ?? '', options: colorOptions(), placeholder: 'var(--rise-primary)' }
}

function styleFields(name: string, base: ImageMapStateStyle, error: string | undefined): EditorField[] {
	return [
		text({ key: 'name', label: t.FIELD_STYLE_NAME }, name, error),
		colorField('fill', t.FIELD_FILL, base.fill),
		colorField('stroke', t.FIELD_STROKE, base.stroke),
		{ key: 'strokeWidth', kind: 'number', label: t.FIELD_STROKE_WIDTH, value: base.strokeWidth ?? null, min: 0, precision: 1 },
		{ key: 'fillOpacity', kind: 'number', label: t.FIELD_FILL_OPACITY, value: base.fillOpacity ?? null, min: 0, max: 1 },
	]
}

export function styleRows(data: ImageMapData, errors: Record<string, string>): EditorListRow[] {
	return Object.entries(data.styles ?? {}).map(([name, style], index) => ({
		title: name,
		deleteLabel: formatMessage(t.DELETE_STYLE, { name }),
		fields: styleFields(name, style.base ?? {}, errors[`${index}.name`]),
	}))
}

export function isStyleKey(key: string): key is (typeof STYLE_KEYS)[number] {
	return (STYLE_KEYS as readonly string[]).includes(key)
}

function required(value: FieldValue): boolean {
	return String(value ?? '').trim() !== ''
}

export function filterIssue(data: ImageMapData, at: { index: number; key: string }, value: FieldValue): string | undefined {
	const { index, key } = at
	if (key === 'type' || key === 'logic') return undefined
	if (!required(value)) return key === 'id' ? t.ID_REQUIRED : t.FIELD_REQUIRED
	const taken = (data.filters ?? []).some((filter, other) => other !== index && filter.id === String(value).trim())
	return key === 'id' && taken ? t.ID_TAKEN : undefined
}

export function optionIssue(data: ImageMapData, at: EditorRowPath & { key: string }, value: FieldValue): string | undefined {
	if (!required(value)) return t.FIELD_REQUIRED
	const options = data.filters?.[at.index]?.options ?? []
	const taken = options.some((option, other) => other !== at.child && option.value === String(value).trim())
	return at.key === 'value' && taken ? t.VALUE_TAKEN : undefined
}

export function styleIssue(data: ImageMapData, name: string, change: { key: string; value: FieldValue }): string | undefined {
	const { key, value } = change
	if (key !== 'name') return undefined
	if (!required(value)) return t.FIELD_REQUIRED
	const next = String(value).trim()
	return next !== name && Object.keys(data.styles ?? {}).includes(next) ? t.NAME_TAKEN : undefined
}

export function styleName(data: ImageMapData, index: number): string | undefined {
	return Object.keys(data.styles ?? {})[index]
}
