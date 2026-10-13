import { issueText } from '../fields3d'
import { formatMessage } from '@/locales/state'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import type { ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'
import type { ImageMap3DObject } from '@components/BaseImageMap3D/types/imageMap3dData.types'
import type { EditorField, EditorFieldValue as FieldValue, EditorListRow } from '../../../types/imageMapEditorInternal.types'

function numberField(field: { key: string; label: string }, value: number | undefined, error: string | undefined): EditorField {
	return { ...field, kind: 'number', value: value ?? null, min: 0, precision: 2, error }
}

export function partRows(object: ImageMapObject | undefined, errors: Record<string, string>): EditorListRow[] {
	if (object?.type !== 'svg') return []
	const t = UI_IMAGE_MAP_EDITOR
	return ((object as ImageMap3DObject).parts ?? []).map((part, index) => {
		const params = { n: index + 1, element: part.elementId }
		return {
			title: formatMessage(t.PART_TITLE, params),
			deleteLabel: formatMessage(t.DELETE_PART, params),
			fields: [
				{
					key: 'elementId',
					kind: 'text',
					label: t.FIELD_PART_ELEMENT,
					value: part.elementId,
					error: errors[`${index}.elementId`],
					isTrimmedOnBlur: true,
				},
				numberField({ key: 'height3d', label: t.FIELD_PART_HEIGHT }, part.height3d, errors[`${index}.height3d`]),
				numberField({ key: 'base3d', label: t.FIELD_PART_BASE }, part.base3d, errors[`${index}.base3d`]),
			],
		}
	})
}

export function addPart(object: ImageMapObject): void {
	if (object.type !== 'svg') return
	const target = object as ImageMap3DObject
	target.parts = [...(target.parts ?? []), { elementId: object.elementId }]
}

export function removePart(object: ImageMapObject, index: number): void {
	const target = object as ImageMap3DObject
	target.parts?.splice(index, 1)
	if (!target.parts?.length) delete target.parts
}

export function applyPart(object: ImageMapObject, index: number, change: { key: string; value: FieldValue }): void {
	const { key, value } = change
	const part = (object as ImageMap3DObject).parts?.[index] as Record<string, unknown> | undefined
	if (!part) return
	if (key === 'elementId') part.elementId = String(value ?? '')
	else if (typeof value === 'number') part[key] = value
	else delete part[key]
}

export function partIssue(object: ImageMapObject, index: number, change: { key: string; value: FieldValue }): string | undefined {
	const candidate = JSON.parse(JSON.stringify(object)) as ImageMap3DObject
	applyPart(candidate, index, change)
	return issueText({ layers: [], objects: [candidate] }, `objects["${object.id}"].parts[${index}].${change.key}`)
}
