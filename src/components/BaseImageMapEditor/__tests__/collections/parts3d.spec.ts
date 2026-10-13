import { UI_IMAGE_MAP_EDITOR } from '../../../../locales/messages'
import type { ImageMapObject } from '../../../BaseImageMap/types/imageMapData.types'
import type { ImageMap3DObject } from '../../../BaseImageMap3D/types/imageMap3dData.types'
import { addPart, applyPart, partIssue, partRows, removePart } from '../../model/panel/collections/parts3d'

const t = UI_IMAGE_MAP_EDITOR

function svg(extra: Partial<ImageMap3DObject> = {}): ImageMapObject {
	return { type: 'svg', id: 'hall', title: 'Холл', elementId: 'hall-el', ...extra } as ImageMapObject
}

const RECT: ImageMapObject = { type: 'rect', id: 'r', title: 'R', x: 0, y: 0, width: 0.1, height: 0.1 }

function parts(object: ImageMapObject) {
	return (object as ImageMap3DObject).parts
}

describe('parts3d: строки', () => {
	it('части svg-объекта: id элемента, высота, основание, ошибки по номеру', () => {
		const object = svg({
			parts: [
				{ elementId: 'roof', height3d: 5 },
				{ elementId: 'base', base3d: 2 },
			],
		})
		const rows = partRows(object, { '1.base3d': 'ошибка' })
		expect(rows.map(row => row.title)).toEqual(['Часть 1: roof', 'Часть 2: base'])
		expect(rows[1]?.deleteLabel).toBe('Удалить часть 2: base')
		expect(rows[0]?.fields.map(field => field.key)).toEqual(['elementId', 'height3d', 'base3d'])
		expect(rows[0]?.fields[0]).toMatchObject({ kind: 'text', value: 'roof', isTrimmedOnBlur: true, label: t.FIELD_PART_ELEMENT })
		expect(rows[0]?.fields[1]).toMatchObject({ kind: 'number', value: 5, min: 0 })
		expect(rows[0]?.fields[2]?.value).toBeNull()
		expect(rows[1]?.fields[2]).toMatchObject({ value: 2, error: 'ошибка' })
	})

	it('без частей, у объектов других видов и без объекта — пусто', () => {
		expect(partRows(svg(), {})).toEqual([])
		expect(partRows(RECT, {})).toEqual([])
		expect(partRows(undefined, {})).toEqual([])
	})
})

describe('parts3d: правка', () => {
	it('addPart берёт id элемента объекта; у других видов ничего не делает', () => {
		const object = svg()
		addPart(object)
		addPart(object)
		expect(parts(object)).toEqual([{ elementId: 'hall-el' }, { elementId: 'hall-el' }])
		addPart(RECT)
		expect(parts(RECT)).toBeUndefined()
	})

	it('removePart убирает часть, а последняя — поле parts', () => {
		const object = svg({ parts: [{ elementId: 'a' }, { elementId: 'b' }] })
		removePart(object, 0)
		expect(parts(object)).toEqual([{ elementId: 'b' }])
		removePart(object, 0)
		expect(parts(object)).toBeUndefined()
		removePart(object, 0)
	})

	it('applyPart: id как есть, числа ставятся, пусто удаляет, чужой номер игнорируется', () => {
		const object = svg({ parts: [{ elementId: 'a', height3d: 3 }] })
		applyPart(object, 0, { key: 'elementId', value: ' b ' })
		applyPart(object, 0, { key: 'base3d', value: 1 })
		applyPart(object, 0, { key: 'height3d', value: null })
		expect(parts(object)).toEqual([{ elementId: ' b ', base3d: 1 }])
		applyPart(object, 0, { key: 'elementId', value: null })
		expect(parts(object)?.[0]?.elementId).toBe('')
		applyPart(object, 4, { key: 'base3d', value: 1 })
		applyPart(svg(), 0, { key: 'base3d', value: 1 })
		expect(parts(object)).toHaveLength(1)
	})

	it('partIssue: как validate3d — пустой id, отрицательные числа; верное значение и пусто — без ошибки', () => {
		const object = svg({ parts: [{ elementId: 'a' }] })
		expect(partIssue(object, 0, { key: 'elementId', value: '  ' })).toBe('Ожидается непустая строка')
		expect(partIssue(object, 0, { key: 'height3d', value: -1 })).toBe('Ожидается число не меньше 0')
		expect(partIssue(object, 0, { key: 'base3d', value: -0.5 })).toBe('Ожидается число не меньше 0')
		expect(partIssue(object, 0, { key: 'base3d', value: 0 })).toBeUndefined()
		expect(partIssue(object, 0, { key: 'height3d', value: null })).toBeUndefined()
		expect(partIssue(object, 0, { key: 'elementId', value: 'roof' })).toBeUndefined()
		expect(parts(object)).toEqual([{ elementId: 'a' }])
	})
})
