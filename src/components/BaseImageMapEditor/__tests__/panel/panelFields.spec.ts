import { objectSections } from '../../model/panel/objectFields'
import { UI_IMAGE_MAP_EDITOR } from '../../../../locales/messages'
import { groupFields, layerFields } from '../../model/panel/mapFields'
import type { EditorField, EditorFieldSection } from '../../types/imageMapEditorInternal.types'
import type { ImageMapData, ImageMapLayer, ImageMapObject } from '../../../BaseImageMap/types/imageMapData.types'

const t = UI_IMAGE_MAP_EDITOR

function keys(fields: EditorField[]): string[] {
	return fields.map(field => field.key)
}

function section(sections: EditorFieldSection[], id: string): EditorField[] {
	return sections.find(item => item.id === id)?.fields ?? []
}

function field(fields: EditorField[], key: string): EditorField | undefined {
	return fields.find(item => item.key === key)
}

function makeData(extra: Partial<ImageMapData> = {}): ImageMapData {
	return { layers: [{ id: 'floor-1', title: 'Первый', width: 100, height: 100 }], objects: [], ...extra }
}

const TWO_LAYERS: ImageMapLayer[] = [
	{ id: 'floor-1', title: 'Первый', width: 100, height: 100 },
	{ id: 'floor-2', title: 'Второй', width: 100, height: 100 },
]

describe('mapFields: слой', () => {
	it('слой с картинкой: поле image и размеры', () => {
		const fields = layerFields({ id: 'l', title: 'Этаж', image: 'https://x/a.png', width: 800, height: 600 })
		expect(keys(fields)).toEqual(['title', 'shortTitle', 'image', 'imageAlt', 'width', 'height'])
		expect(field(fields, 'title')).toEqual({ key: 'title', kind: 'text', label: t.FIELD_LAYER_TITLE, value: 'Этаж' })
		expect(field(fields, 'shortTitle')).toMatchObject({ value: '', placeholder: '1' })
		expect(field(fields, 'image')).toMatchObject({ value: 'https://x/a.png', placeholder: 'https://' })
		expect(field(fields, 'imageAlt')?.value).toBe('')
		expect(field(fields, 'width')).toMatchObject({ kind: 'number', value: 800, min: 1, precision: 0 })
		expect(field(fields, 'height')).toMatchObject({ kind: 'number', value: 600 })
	})

	it('data: URL картинки показывается пустым', () => {
		const fields = layerFields({ id: 'l', title: 'Этаж', image: 'data:image/png;base64,AAA', width: 1, height: 1 })
		expect(field(fields, 'image')?.value).toBe('')
	})

	it('слой без картинки — пустое поле image', () => {
		expect(field(layerFields({ id: 'l', title: 'Этаж', width: 1, height: 1 }), 'image')?.value).toBe('')
	})

	it('svg-слой без поля image; svgUrl добавляет поле', () => {
		const inline = layerFields({ id: 'l', title: 'Этаж', svg: '<svg/>', width: 1, height: 1 })
		expect(keys(inline)).toEqual(['title', 'shortTitle', 'imageAlt', 'width', 'height'])
		const remote = layerFields({ id: 'l', title: 'Этаж', svg: '<svg/>', svgUrl: '/plan.svg', width: 1, height: 1 })
		expect(keys(remote)).toEqual(['title', 'shortTitle', 'svgUrl', 'imageAlt', 'width', 'height'])
		expect(field(remote, 'svgUrl')).toMatchObject({ kind: 'text', label: t.FIELD_SVG_URL, value: '/plan.svg' })
	})
})

describe('mapFields: группа', () => {
	it('название, цвет и значок', () => {
		const fields = groupFields({ id: 'g', title: 'Кафе', color: 'red' }, makeData())
		expect(keys(fields)).toEqual(['title', 'color', 'icon'])
		expect(field(fields, 'title')?.value).toBe('Кафе')
		expect(field(fields, 'color')).toMatchObject({ value: 'red', placeholder: 'var(--rise-primary)' })
		expect(field(fields, 'icon')).toMatchObject({ value: '', placeholder: 'map-pin' })
	})
})

describe('mapFields: стиль группы', () => {
	it('при именованных стилях — выбор стиля из списка', () => {
		const data = makeData({ styles: { accent: { base: { fill: 'red' } } } })
		const fields = groupFields({ id: 'g', title: 'Кафе', style: 'accent' }, data)
		expect(keys(fields)).toEqual(['title', 'color', 'icon', 'style'])
		expect(field(fields, 'style')).toMatchObject({ kind: 'select', value: 'accent' })
		expect(field(fields, 'style')?.options).toEqual([
			{ value: '', label: t.STYLE_NONE },
			{ value: 'accent', label: 'accent' },
		])
		expect(field(groupFields({ id: 'g', title: 'Кафе' }, data), 'style')?.value).toBe('')
	})
})

describe('objectFields: разделы', () => {
	it('точка: подпись, размер и переключатели', () => {
		const object: ImageMapObject = {
			id: 'p',
			title: 'Вход',
			type: 'point',
			x: 0.12345,
			y: 0.5,
			label: 'A',
			size: 32,
			isPulsing: true,
		}
		const sections = objectSections(object, makeData(), {})
		expect(sections.map(item => item.id)).toEqual(['main', 'geometry', 'action', 'style', 'directory'])
		const geometry = section(sections, 'geometry')
		expect(keys(geometry)).toEqual(['geo.x', 'geo.y', 'label', 'icon', 'size', 'isScaled', 'isPulsing'])
		expect(field(geometry, 'geo.x')).toMatchObject({ kind: 'number', value: 12.35, min: 0, max: 100 })
		expect(field(geometry, 'label')?.value).toBe('A')
		expect(field(geometry, 'icon')).toMatchObject({ value: '', placeholder: 'map-pin' })
		expect(field(geometry, 'size')).toMatchObject({ value: 32, min: 8, max: 128 })
		expect(field(geometry, 'isScaled')).toMatchObject({ kind: 'switch', value: false })
		expect(field(geometry, 'isPulsing')?.value).toBe(true)
	})

	it('точка без размера — size null', () => {
		const sections = objectSections({ id: 'p', title: '', type: 'point', x: 0, y: 0 }, makeData(), {})
		expect(field(section(sections, 'geometry'), 'size')?.value).toBeNull()
	})

	it('прямоугольник', () => {
		const object: ImageMapObject = { id: 'r', title: '', type: 'rect', x: 0.1, y: 0.2, width: 0.3, height: 0.4 }
		const geometry = section(objectSections(object, makeData(), {}), 'geometry')
		expect(geometry.map(item => [item.key, item.value])).toEqual([
			['geo.x', 10],
			['geo.y', 20],
			['geo.width', 30],
			['geo.height', 40],
		])
	})

	it('эллипс', () => {
		const object: ImageMapObject = { id: 'e', title: '', type: 'ellipse', x: 0.5, y: 0.6, rx: 0.1, ry: 0.2 }
		const geometry = section(objectSections(object, makeData(), {}), 'geometry')
		expect(geometry.map(item => [item.key, item.label, item.value])).toEqual([
			['geo.x', t.FIELD_CX, 50],
			['geo.y', t.FIELD_CY, 60],
			['geo.rx', t.FIELD_RX, 10],
			['geo.ry', t.FIELD_RY, 20],
		])
	})

	it('многоугольник — textarea «x; y»', () => {
		const object: ImageMapObject = {
			id: 'g',
			title: '',
			type: 'polygon',
			points: [
				[0.1, 0.2],
				[0.3, 0.4],
				[0.55555, 1],
			],
		}
		const geometry = section(objectSections(object, makeData(), {}), 'geometry')
		expect(geometry).toEqual([
			{ key: 'geo.points', kind: 'textarea', label: t.FIELD_POINTS, value: '10; 20\n30; 40\n55.56; 100', error: undefined },
		])
	})

	it('svg — elementId и без поля этажа', () => {
		const object: ImageMapObject = { id: 's', title: '', type: 'svg', elementId: 'shop' }
		const sections = objectSections(object, makeData({ layers: TWO_LAYERS }), {})
		expect(section(sections, 'geometry')).toEqual([
			{ key: 'elementId', kind: 'text', label: t.FIELD_ELEMENT_ID, value: 'shop', error: undefined },
		])
		expect(keys(section(sections, 'main'))).not.toContain('layer')
	})

	it('ошибки попадают в поля', () => {
		const object: ImageMapObject = { id: 'r', title: '', type: 'rect', x: 0, y: 0, width: 0.1, height: 0.1 }
		const sections = objectSections(object, makeData(), { id: 'Занят', 'geo.width': 'Мало' })
		expect(field(section(sections, 'main'), 'id')?.error).toBe('Занят')
		expect(field(section(sections, 'geometry'), 'geo.width')?.error).toBe('Мало')
		expect(field(section(sections, 'geometry'), 'geo.x')?.error).toBeUndefined()
	})
})

describe('objectFields: основное', () => {
	it('один слой — без поля этажа; группы с вариантом «без группы»', () => {
		const object: ImageMapObject = { id: 'p', title: 'Вход', type: 'point', x: 0, y: 0, description: 'Текст' }
		const main = section(objectSections(object, makeData(), {}), 'main')
		expect(keys(main)).toEqual(['id', 'title', 'description', 'group', 'image'])
		expect(field(main, 'id')).toMatchObject({ value: 'p', error: undefined })
		expect(field(main, 'description')).toMatchObject({ kind: 'textarea', value: 'Текст' })
		expect(field(main, 'group')).toMatchObject({ kind: 'select', value: '', options: [{ value: '', label: t.NO_GROUP }] })
		expect(field(main, 'image')).toMatchObject({ value: '', placeholder: 'https://' })
	})

	it('несколько слоёв — поле этажа; без layer выбран первый', () => {
		const data = makeData({ layers: TWO_LAYERS, groups: [{ id: 'g1', title: 'Кафе' }] })
		const free = section(objectSections({ id: 'p', title: '', type: 'point', x: 0, y: 0, group: 'g1' }, data, {}), 'main')
		expect(field(free, 'layer')).toMatchObject({
			kind: 'select',
			value: 'floor-1',
			options: [
				{ value: 'floor-1', label: 'Первый' },
				{ value: 'floor-2', label: 'Второй' },
			],
		})
		expect(field(free, 'description')?.value).toBe('')
		expect(field(free, 'group')).toMatchObject({ value: 'g1', options: [{ value: '' }, { value: 'g1', label: 'Кафе' }] })
		const placed = section(objectSections({ id: 'p', title: '', type: 'point', x: 0, y: 0, layer: 'floor-2' }, data, {}), 'main')
		expect(field(placed, 'layer')?.value).toBe('floor-2')
	})
})

describe('objectFields: действие', () => {
	it('по умолчанию — только выбор действия', () => {
		const action = section(objectSections({ id: 'p', title: '', type: 'point', x: 0, y: 0 }, makeData(), {}), 'action')
		expect(keys(action)).toEqual(['action'])
		expect(action[0]?.value).toBe('')
		expect(action[0]?.options?.map(option => option.value)).toEqual(['', 'popup', 'link', 'layer', 'none'])
		expect(action[0]?.options?.[0]?.label).toBe(t.ACTION_DEFAULT)
	})

	it('link — адрес и внешняя ссылка', () => {
		const object: ImageMapObject = {
			id: 'p',
			title: '',
			type: 'point',
			x: 0,
			y: 0,
			action: 'link',
			link: 'https://x',
			isLinkExternal: true,
		}
		const action = section(objectSections(object, makeData(), {}), 'action')
		expect(keys(action)).toEqual(['action', 'link', 'isLinkExternal'])
		expect(field(action, 'action')?.value).toBe('link')
		expect(field(action, 'link')).toMatchObject({ value: 'https://x', placeholder: 'https://' })
		expect(field(action, 'isLinkExternal')?.value).toBe(true)
	})

	it('layer — выбор этажа', () => {
		const object: ImageMapObject = { id: 'p', title: '', type: 'point', x: 0, y: 0, action: 'layer', targetLayer: 'floor-2' }
		const action = section(objectSections(object, makeData({ layers: TWO_LAYERS }), {}), 'action')
		expect(keys(action)).toEqual(['action', 'targetLayer'])
		expect(field(action, 'targetLayer')).toMatchObject({ kind: 'select', value: 'floor-2' })
		expect(field(action, 'targetLayer')?.options).toHaveLength(2)
	})
})

describe('objectFields: стиль', () => {
	it('без именованных стилей — fill, stroke и fillOpacity', () => {
		const object: ImageMapObject = {
			id: 'r',
			title: '',
			type: 'rect',
			x: 0,
			y: 0,
			width: 0.1,
			height: 0.1,
			style: { base: { fill: 'red', fillOpacity: 0.4 } },
		}
		const style = section(objectSections(object, makeData(), {}), 'style')
		expect(keys(style)).toEqual(['style.fill', 'style.stroke', 'style.fillOpacity'])
		expect(style.map(item => item.value)).toEqual(['red', '', 0.4])
		expect(field(style, 'style.fillOpacity')).toMatchObject({ kind: 'number', min: 0, max: 1 })
	})

	it('без стиля — пустые значения', () => {
		const style = section(objectSections({ id: 'p', title: '', type: 'point', x: 0, y: 0 }, makeData(), {}), 'style')
		expect(style.map(item => item.value)).toEqual(['', '', null])
	})

	it('стиль без base — пустые значения', () => {
		const object: ImageMapObject = { id: 'p', title: '', type: 'point', x: 0, y: 0, style: { hover: { fill: 'red' } } }
		const style = section(objectSections(object, makeData(), {}), 'style')
		expect(style.map(item => item.value)).toEqual(['', '', null])
	})

	it('с data.styles — выбор styleName и свои поля', () => {
		const data = makeData({ styles: { accent: {}, muted: {} } })
		const object: ImageMapObject = { id: 'p', title: '', type: 'point', x: 0, y: 0, style: { base: { stroke: 'blue' } } }
		const style = section(objectSections(object, data, {}), 'style')
		expect(keys(style)).toEqual(['styleName', 'style.fill', 'style.stroke', 'style.fillOpacity'])
		expect(field(style, 'styleName')).toMatchObject({
			kind: 'select',
			value: '',
			options: [
				{ value: '', label: t.STYLE_OWN },
				{ value: 'accent', label: 'accent' },
				{ value: 'muted', label: 'muted' },
			],
		})
		expect(field(style, 'style.stroke')?.value).toBe('blue')
	})

	it('именованный стиль — только выбор', () => {
		const data = makeData({ styles: { accent: {} } })
		const object: ImageMapObject = { id: 'p', title: '', type: 'point', x: 0, y: 0, style: 'accent' }
		const style = section(objectSections(object, data, {}), 'style')
		expect(style).toHaveLength(1)
		expect(style[0]).toMatchObject({ key: 'styleName', value: 'accent' })
	})

	it('именованный стиль без data.styles — полей нет', () => {
		const object: ImageMapObject = { id: 'p', title: '', type: 'point', x: 0, y: 0, style: 'accent' }
		expect(section(objectSections(object, makeData(), {}), 'style')).toEqual([])
	})
})

describe('objectFields: справочник', () => {
	it('метки, слова и переключатели', () => {
		const empty = section(objectSections({ id: 'p', title: '', type: 'point', x: 0, y: 0 }, makeData(), {}), 'directory')
		expect(keys(empty)).toEqual(['tags', 'keywords', 'isHiddenInDirectory', 'isTooltipHidden', 'isDisabled'])
		expect(empty.map(item => item.value)).toEqual([[], [], false, false, false])
		const object: ImageMapObject = {
			id: 'p',
			title: '',
			type: 'point',
			x: 0,
			y: 0,
			tags: ['a'],
			keywords: ['b'],
			isHiddenInDirectory: true,
			isTooltipHidden: true,
			isDisabled: true,
		}
		const filled = section(objectSections(object, makeData(), {}), 'directory')
		expect(filled.map(item => item.value)).toEqual([['a'], ['b'], true, true, true])
		expect(field(filled, 'tags')?.kind).toBe('tags')
	})
})
