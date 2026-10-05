import { UI_IMAGE_MAP_EDITOR } from '../../../../locales/messages'
import type { EditorField } from '../../types/imageMapEditorInternal.types'
import type { ImageMapLayer, ImageMapObject } from '../../../BaseImageMap/types/imageMapData.types'
import type { ImageMap3DData, ImageMap3DLayer } from '../../../BaseImageMap3D/types/imageMap3dData.types'
import {
	applyLayer3d,
	applyScene3d,
	is3dObjectKey,
	layer3dFields,
	layer3dIssue,
	object3dIssue,
	object3dSection,
	scene3dFields,
	scene3dIssue,
} from '../../model/panel/fields3d'

const t = UI_IMAGE_MAP_EDITOR

const RECT: ImageMapObject = { type: 'rect', id: 'shop', title: 'Магазин', x: 0.1, y: 0.1, width: 0.2, height: 0.2 }

function layer(extra: Partial<ImageMap3DLayer> = {}): ImageMap3DLayer {
	return { id: 'f1', title: 'Этаж 1', width: 1000, height: 600, ...extra }
}

function keys(fields: EditorField[]): string[] {
	return fields.map(field => field.key)
}

describe('fields3d: объект', () => {
	it('раздел 3D: высота и узел модели, плейсхолдер узла — id', () => {
		const section = object3dSection({ ...RECT, height3d: 40, meshName: 'Shop_A' } as ImageMapObject, { height3d: 'ошибка' })
		expect(section).toMatchObject({ id: '3d', title: t.SECTION_3D })
		expect(section.fields[0]).toMatchObject({ key: 'height3d', kind: 'number', value: 40, min: 0, error: 'ошибка' })
		expect(section.fields[1]).toMatchObject({ key: 'meshName', kind: 'text', value: 'Shop_A', placeholder: 'shop' })
		const empty = object3dSection(RECT, {})
		expect(empty.fields.map(field => field.value)).toEqual([null, ''])
	})

	it('is3dObjectKey — только height3d и meshName', () => {
		expect(is3dObjectKey('height3d')).toBe(true)
		expect(is3dObjectKey('meshName')).toBe(true)
		expect(is3dObjectKey('title')).toBe(false)
	})

	it('object3dIssue: пробелы в узле и отрицательная высота — ошибка; пусто и верные значения — нет', () => {
		expect(object3dIssue(RECT, 'meshName', '  ')).toBe('Ожидается непустая строка')
		expect(object3dIssue(RECT, 'height3d', -1)).toBe('Ожидается число не меньше 0')
		expect(object3dIssue(RECT, 'meshName', '')).toBeUndefined()
		expect(object3dIssue(RECT, 'height3d', null)).toBeUndefined()
		expect(object3dIssue(RECT, 'height3d', 12)).toBeUndefined()
		expect(object3dIssue(RECT, 'title', '')).toBeUndefined()
	})
})

describe('fields3d: этаж', () => {
	it('без модели — высота этажа и адрес модели', () => {
		const fields = layer3dFields(layer({ elevation: 120 }), { elevation: 'x' })
		expect(keys(fields)).toEqual(['elevation', 'model.url'])
		expect(fields[0]).toMatchObject({ value: 120, label: t.FIELD_ELEVATION, error: 'x' })
		expect(fields[1]).toMatchObject({ value: '', placeholder: '/maps/floor-1.glb' })
	})

	it('с моделью — масштаб, сдвиг X/Y/Z и поворот', () => {
		const fields = layer3dFields(layer({ model: { url: '/f1.glb', scale: 2, position: [1, 2, 3], rotationY: 90 } }), {})
		expect(keys(fields)).toEqual(['elevation', 'model.url', 'model.scale', 'model.x', 'model.y', 'model.z', 'model.rotationY'])
		expect(fields.map(field => field.value)).toEqual([null, '/f1.glb', 2, 1, 2, 3, 90])
		const bare = layer3dFields(layer({ model: { url: '/f1.glb' } }), {})
		expect(bare.slice(2).map(field => field.value)).toEqual([null, null, null, null, null])
	})

	it('applyLayer3d: высота, адрес, масштаб, сдвиг по осям и поворот', () => {
		const target = layer() as ImageMapLayer
		applyLayer3d(target, 'elevation', 50)
		applyLayer3d(target, 'model.scale', 2)
		expect(target).toEqual(layer({ elevation: 50 }))
		applyLayer3d(target, 'model.url', ' /f1.glb ')
		applyLayer3d(target, 'model.scale', 2)
		applyLayer3d(target, 'model.y', 5)
		applyLayer3d(target, 'model.rotationY', 45)
		expect((target as ImageMap3DLayer).model).toEqual({ url: '/f1.glb', scale: 2, position: [0, 5, 0], rotationY: 45 })
		applyLayer3d(target, 'model.y', null)
		applyLayer3d(target, 'model.scale', null)
		expect((target as ImageMap3DLayer).model).toEqual({ url: '/f1.glb', rotationY: 45 })
		applyLayer3d(target, 'model.url', '')
		applyLayer3d(target, 'elevation', null)
		expect(target).toEqual(layer())
	})

	it('layer3dIssue: масштаб 0 и пустой адрес у модели — ошибка, остальное — нет', () => {
		const withModel = layer({ model: { url: '/f1.glb' } })
		expect(layer3dIssue(withModel, 'model.scale', 0)).toBe('Ожидается число больше 0')
		expect(layer3dIssue(withModel, 'model.scale', 1.5)).toBeUndefined()
		expect(layer3dIssue(withModel, 'model.x', 10)).toBeUndefined()
		expect(layer3dIssue(withModel, 'elevation', -20)).toBeUndefined()
		expect(layer3dIssue(withModel, 'model.url', '')).toBeUndefined()
		expect(withModel.model).toEqual({ url: '/f1.glb' })
	})
})

describe('fields3d: сцена', () => {
	it('три поля сцены с ошибками', () => {
		const fields = scene3dFields({ floorGap: 200 }, { floorThickness: 'x' })
		expect(keys(fields)).toEqual(['floorGap', 'floorThickness', 'objectHeight'])
		expect(fields.map(field => field.value)).toEqual([200, null, null])
		expect(fields[1]).toMatchObject({ label: t.FIELD_FLOOR_THICKNESS, min: 0, error: 'x' })
		expect(scene3dFields(undefined, {}).map(field => field.value)).toEqual([null, null, null])
	})

	it('applyScene3d: пустая сцена удаляется', () => {
		const data: ImageMap3DData = { layers: [], objects: [] }
		applyScene3d(data, 'floorGap', 200)
		expect(data.scene3d).toEqual({ floorGap: 200 })
		applyScene3d(data, 'floorGap', null)
		expect(data).not.toHaveProperty('scene3d')
	})

	it('scene3dIssue: толщина 0 — ошибка, расстояние 0 — нет', () => {
		expect(scene3dIssue({ layers: [], objects: [] }, 'floorThickness', 0)).toBe('Ожидается число больше 0')
		expect(scene3dIssue({ layers: [], objects: [], scene3d: { floorGap: 1 } }, 'floorGap', 0)).toBeUndefined()
	})
})
