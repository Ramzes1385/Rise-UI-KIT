import { formatMessage } from '@/locales/state'
import { UI_IMAGE_MAP_EDITOR } from '@/locales/messages'
import { expectedText, validate3dData } from '@components/BaseImageMap3D/model/validate3d'
import type { ImageMapLayer, ImageMapObject } from '@components/BaseImageMap/types/imageMapData.types'
import type { EditorField, EditorFieldSection, EditorFieldValue as FieldValue } from '../../types/imageMapEditorInternal.types'
import type {
	ImageMap3DData,
	ImageMap3DLayer,
	ImageMap3DObject,
	ImageMapLayerModel,
	ImageMapScene3D,
} from '@components/BaseImageMap3D/types/imageMap3dData.types'

const AXES = ['model.x', 'model.y', 'model.z']

const LAYER_PATHS: Record<string, string> = {
	elevation: 'elevation',
	'model.url': 'model.url',
	'model.scale': 'model.scale',
	'model.x': 'model.position',
	'model.y': 'model.position',
	'model.z': 'model.position',
	'model.rotationY': 'model.rotationY',
}

const SCENE_KEYS = ['floorGap', 'floorThickness', 'objectHeight']

function numberField(key: string, label: string, value: unknown): EditorField {
	return { key, kind: 'number', label, value: typeof value === 'number' ? value : null, precision: 2 }
}

function toNumber(value: FieldValue): number | undefined {
	return typeof value === 'number' ? value : undefined
}

function assign(target: Record<string, unknown>, key: string, value: unknown): void {
	if (value === undefined) delete target[key]
	else target[key] = value
}

function issueText(data: ImageMap3DData, path: string): string | undefined {
	const issue = validate3dData(data).find(item => item.path === path)
	return issue ? formatMessage(UI_IMAGE_MAP_EDITOR.FIELD_3D_INVALID, { expected: expectedText(issue.rule) }) : undefined
}

function copy<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T
}

export function is3dObjectKey(key: string): boolean {
	return key === 'height3d' || key === 'meshName'
}

export function object3dSection(object: ImageMapObject, errors: Record<string, string>): EditorFieldSection {
	const t = UI_IMAGE_MAP_EDITOR
	const fields = object as ImageMap3DObject
	return {
		id: '3d',
		title: t.SECTION_3D,
		fields: [
			{ ...numberField('height3d', t.FIELD_HEIGHT_3D, fields.height3d), min: 0, error: errors.height3d },
			{
				key: 'meshName',
				kind: 'text',
				label: t.FIELD_MESH_NAME,
				value: fields.meshName ?? '',
				placeholder: object.id,
				error: errors.meshName,
			},
		],
	}
}

export function object3dIssue(object: ImageMapObject, key: string, value: FieldValue): string | undefined {
	if (!is3dObjectKey(key)) return undefined
	const candidate = { ...object } as ImageMap3DObject & Record<string, unknown>
	const isEmpty = value === null || (typeof value === 'string' && value === '')
	assign(candidate, key, isEmpty ? undefined : value)
	return issueText({ layers: [], objects: [candidate] }, `objects["${object.id}"].${key}`)
}

function modelFields(model: ImageMapLayerModel | undefined): EditorField[] {
	const t = UI_IMAGE_MAP_EDITOR
	const url: EditorField = {
		key: 'model.url',
		kind: 'text',
		label: t.FIELD_MODEL_URL,
		value: model?.url ?? '',
		placeholder: '/maps/floor-1.glb',
	}
	if (!model?.url) return [url]
	const position = model.position ?? []
	const axes = [t.FIELD_MODEL_X, t.FIELD_MODEL_Y, t.FIELD_MODEL_Z]
	return [
		url,
		{ ...numberField('model.scale', t.FIELD_MODEL_SCALE, model.scale), min: 0 },
		...AXES.map((key, index) => numberField(key, axes[index] as string, position[index])),
		numberField('model.rotationY', t.FIELD_MODEL_ROTATION, model.rotationY),
	]
}

export function layer3dFields(layer: ImageMapLayer, errors: Record<string, string>): EditorField[] {
	const fields = layer as ImageMap3DLayer
	return [numberField('elevation', UI_IMAGE_MAP_EDITOR.FIELD_ELEVATION, fields.elevation), ...modelFields(fields.model)].map(field => ({
		...field,
		error: errors[field.key],
	}))
}

function applyModel(layer: ImageMap3DLayer, key: string, value: FieldValue): void {
	if (key === 'model.url') {
		const url = String(value ?? '').trim()
		if (url) layer.model = { ...layer.model, url }
		else delete layer.model
		return
	}
	if (!layer.model) return
	const model = layer.model as unknown as Record<string, unknown>
	const axis = AXES.indexOf(key)
	if (axis < 0) {
		assign(model, key.slice('model.'.length), toNumber(value))
		return
	}
	const position: [number, number, number] = [...(layer.model.position ?? [0, 0, 0])]
	position[axis] = toNumber(value) ?? 0
	assign(model, 'position', position.some(Boolean) ? position : undefined)
}

export function applyLayer3d(layer: ImageMapLayer, key: string, value: FieldValue): void {
	const target = layer as ImageMap3DLayer
	if (key === 'elevation') assign(target as unknown as Record<string, unknown>, 'elevation', toNumber(value))
	else applyModel(target, key, value)
}

export function layer3dIssue(layer: ImageMapLayer, key: string, value: FieldValue): string | undefined {
	const candidate = copy(layer)
	applyLayer3d(candidate, key, value)
	return issueText({ layers: [candidate], objects: [] }, `layers["${layer.id}"].${LAYER_PATHS[key]}`)
}

export function scene3dFields(scene: ImageMapScene3D | undefined, errors: Record<string, string>): EditorField[] {
	const t = UI_IMAGE_MAP_EDITOR
	const labels = [t.FIELD_FLOOR_GAP, t.FIELD_FLOOR_THICKNESS, t.FIELD_OBJECT_HEIGHT]
	return SCENE_KEYS.map((key, index) => ({
		...numberField(key, labels[index] as string, scene?.[key as keyof ImageMapScene3D]),
		min: 0,
		error: errors[key],
	}))
}

export function applyScene3d(data: ImageMap3DData, key: string, value: FieldValue): void {
	const scene: Record<string, unknown> = { ...data.scene3d }
	assign(scene, key, toNumber(value))
	if (Object.keys(scene).length) data.scene3d = scene as ImageMapScene3D
	else delete data.scene3d
}

export function scene3dIssue(data: ImageMap3DData, key: string, value: FieldValue): string | undefined {
	const candidate: ImageMap3DData = { layers: [], objects: [], scene3d: data.scene3d ? { ...data.scene3d } : undefined }
	applyScene3d(candidate, key, value)
	return issueText(candidate, `scene3d.${key}`)
}
