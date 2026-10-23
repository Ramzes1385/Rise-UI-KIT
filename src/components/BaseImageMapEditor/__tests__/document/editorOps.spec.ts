import type { ImageMapData } from '../../../BaseImageMap/types/imageMapData.types'
import {
	addGroup,
	addLayer,
	allIds,
	createId,
	duplicateObject,
	findObject,
	layerObjects,
	moveLayer,
	objectLayerId,
	patchGroup,
	patchLayer,
	removeGroup,
	removeLayer,
	removeObject,
	renameObject,
} from '../../model/document/editorOps'

function makeData(): ImageMapData {
	return {
		layers: [
			{ id: 'floor-1', title: 'Первый', width: 100, height: 100 },
			{ id: 'floor-2', title: 'Второй', width: 100, height: 100 },
		],
		objects: [
			{ id: 'point-1', title: 'Без слоя', type: 'point', x: 0.5, y: 0.5, group: 'group-1' },
			{ id: 'rect-1', title: 'Первый явно', type: 'rect', x: 0.1, y: 0.1, width: 0.2, height: 0.2, layer: 'floor-1' },
			{ id: 'svg-1', title: 'Второй', type: 'svg', elementId: 'shop', layer: 'floor-2', group: 'group-2' },
		],
		groups: [
			{ id: 'group-1', title: 'Кафе', color: 'red' },
			{ id: 'group-2', title: 'Магазины' },
		],
	}
}

function withRoutes(): ImageMapData {
	return {
		...makeData(),
		routes: {
			nodes: [
				{ id: 'a', x: 0.1, y: 0.1, object: 'rect-1' },
				{ id: 'b', x: 0.5, y: 0.5 },
				{ id: 'c', x: 0.5, y: 0.5, layer: 'floor-2', object: 'svg-1' },
				{ id: 'd', x: 0.6, y: 0.5, layer: 'floor-2' },
			],
			edges: [
				['a', 'b'],
				['c', 'd'],
			],
			transitions: [{ id: 'stairs', nodes: ['b', 'c'] }],
		},
	}
}

describe('editorOps: id и поиск', () => {
	it('createId берёт первый свободный номер', () => {
		expect(createId('rect', [])).toBe('rect-1')
		expect(createId('rect', ['rect-1', 'rect-2', 'rect-4'])).toBe('rect-3')
		expect(createId('rect', new Set(['rect-2']))).toBe('rect-1')
	})

	it('allIds — id всех объектов', () => {
		expect(allIds(makeData())).toEqual(['point-1', 'rect-1', 'svg-1'])
	})

	it('findObject: по id; null, undefined и чужой id — undefined', () => {
		const data = makeData()
		expect(findObject(data, 'rect-1')?.title).toBe('Первый явно')
		expect(findObject(data, null)).toBeUndefined()
		expect(findObject(data, undefined)).toBeUndefined()
		expect(findObject(data, '')).toBeUndefined()
		expect(findObject(data, 'missing')).toBeUndefined()
	})

	it('objectLayerId: свой слой или первый; без слоёв — undefined', () => {
		const data = makeData()
		expect(objectLayerId(data, data.objects[2]!)).toBe('floor-2')
		expect(objectLayerId(data, data.objects[0]!)).toBe('floor-1')
		expect(objectLayerId({ layers: [], objects: [] }, data.objects[0]!)).toBeUndefined()
	})

	it('layerObjects учитывает объекты без слоя у первого слоя', () => {
		const data = makeData()
		expect(layerObjects(data, 'floor-1').map(object => object.id)).toEqual(['point-1', 'rect-1'])
		expect(layerObjects(data, 'floor-2').map(object => object.id)).toEqual(['svg-1'])
		expect(layerObjects(data, undefined)).toEqual([])
	})
})

describe('editorOps: объекты', () => {
	it('removeObject снимает объект с узлов маршрутов', () => {
		const data = withRoutes()
		removeObject(data, 'rect-1')
		expect(data.routes?.nodes.find(node => node.id === 'a')?.object).toBeUndefined()
		expect(data.routes?.nodes).toHaveLength(4)
	})

	it('renameObject меняет id объекта и ссылки узлов; чужой и тот же id — ничего', () => {
		const data = withRoutes()
		renameObject(data, 'rect-1', 'shop')
		expect(allIds(data)).toContain('shop')
		expect(data.routes?.nodes.find(node => node.id === 'a')?.object).toBe('shop')
		renameObject(data, 'missing', 'x')
		renameObject(data, 'shop', 'shop')
		const plain = makeData()
		renameObject(plain, 'point-1', 'p')
		expect(allIds(plain)).toEqual(['p', 'rect-1', 'svg-1'])
		expect(allIds(data)).toEqual(['point-1', 'shop', 'svg-1'])
	})

	it('removeObject удаляет по id', () => {
		const data = makeData()
		removeObject(data, 'rect-1')
		expect(allIds(data)).toEqual(['point-1', 'svg-1'])
	})

	it('duplicateObject делает копию со сдвигом и новым id', () => {
		const data = makeData()
		const copy = duplicateObject(data, 'rect-1')
		expect(copy).toMatchObject({ id: 'rect-2', type: 'rect', x: 0.12, y: 0.12, width: 0.2, height: 0.2, layer: 'floor-1' })
		expect(data.objects[3]).toBe(copy)
		expect(data.objects[1]).toMatchObject({ x: 0.1, y: 0.1 })
	})

	it('duplicateObject: svg и несуществующий — undefined', () => {
		const data = makeData()
		expect(duplicateObject(data, 'svg-1')).toBeUndefined()
		expect(duplicateObject(data, 'missing')).toBeUndefined()
		expect(data.objects).toHaveLength(3)
	})
})

describe('editorOps: слои', () => {
	it('patchLayer меняет слой; чужой id — ничего', () => {
		const data = makeData()
		patchLayer(data, 'floor-2', { title: 'Новый' })
		patchLayer(data, 'missing', { title: 'Нет' })
		expect(data.layers.map(layer => layer.title)).toEqual(['Первый', 'Новый'])
	})

	it('addLayer добавляет слой layer-N', () => {
		const data = makeData()
		const first = addLayer(data, { title: 'Третий', width: 10, height: 20 })
		const second = addLayer(data, { title: 'Четвёртый', width: 10, height: 20 })
		expect(first).toEqual({ id: 'layer-1', title: 'Третий', width: 10, height: 20 })
		expect(second.id).toBe('layer-2')
		expect(data.layers).toHaveLength(4)
	})

	it('removeLayer не первого слоя удаляет только его объекты', () => {
		const data = makeData()
		removeLayer(data, 'floor-2')
		expect(data.layers.map(layer => layer.id)).toEqual(['floor-1'])
		expect(allIds(data)).toEqual(['point-1', 'rect-1'])
		expect(data.objects[0]?.layer).toBeUndefined()
	})

	it('removeLayer первого слоя удаляет и объекты без слоя', () => {
		const data = makeData()
		removeLayer(data, 'floor-1')
		expect(data.layers.map(layer => layer.id)).toEqual(['floor-2'])
		expect(allIds(data)).toEqual(['svg-1'])
	})

	it('removeLayer первого слоя: объект с пустым слоем получает новый первый слой', () => {
		const data = makeData()
		data.objects.push({ id: 'point-2', title: 'Пустой слой', type: 'point', x: 0, y: 0, layer: '' })
		removeLayer(data, 'floor-1')
		expect(allIds(data)).toEqual(['svg-1', 'point-2'])
		expect(data.objects[1]?.layer).toBe('floor-2')
	})

	it('removeLayer чужого id ничего не удаляет', () => {
		const data = makeData()
		removeLayer(data, 'missing')
		expect(data).toEqual(makeData())
	})

	it('moveLayer переставляет слой и фиксирует слой объектов', () => {
		const data = makeData()
		moveLayer(data, 'floor-2', -1)
		expect(data.layers.map(layer => layer.id)).toEqual(['floor-2', 'floor-1'])
		expect(data.objects.map(object => object.layer)).toEqual(['floor-1', 'floor-1', 'floor-2'])
	})

	it('removeLayer убирает узлы этажа, рёбра к ним и узлы переходов', () => {
		const data = withRoutes()
		data.objects[0]!.targetLayer = 'floor-2'
		removeLayer(data, 'floor-2')
		expect(data.routes?.nodes.map(node => node.id)).toEqual(['a', 'b'])
		expect(data.routes?.edges).toEqual([['a', 'b']])
		expect(data.routes?.transitions).toEqual([])
		expect(data.objects[0]?.targetLayer).toBeUndefined()
	})

	it('removeLayer первого слоя: узлы без слоя уходят, узел с пустым слоем получает новый первый', () => {
		const data = withRoutes()
		data.routes?.nodes.push({ id: 'e', x: 0, y: 0, layer: '' })
		data.routes?.transitions?.push({ id: 'lift', nodes: ['c', 'd', 'e'] })
		removeLayer(data, 'floor-1')
		expect(data.routes?.nodes.map(node => [node.id, node.layer])).toEqual([
			['c', 'floor-2'],
			['d', 'floor-2'],
			['e', 'floor-2'],
		])
		expect(data.routes?.edges).toEqual([['c', 'd']])
		expect(data.routes?.transitions).toEqual([{ id: 'lift', nodes: ['c', 'd', 'e'] }])
	})

	it('removeLayer: маршруты без переходов', () => {
		const data = withRoutes()
		delete data.routes?.transitions
		removeLayer(data, 'floor-2')
		expect(data.routes?.transitions).toBeUndefined()
		expect(data.routes?.edges).toEqual([['a', 'b']])
	})

	it('moveLayer фиксирует слой узлов маршрутов', () => {
		const data = withRoutes()
		moveLayer(data, 'floor-2', -1)
		expect(data.routes?.nodes.map(node => node.layer)).toEqual(['floor-1', 'floor-1', 'floor-2', 'floor-2'])
	})

	it('moveLayer вне границ и с чужим id — без изменений', () => {
		const data = makeData()
		moveLayer(data, 'floor-1', -1)
		moveLayer(data, 'floor-2', 1)
		moveLayer(data, 'missing', 1)
		expect(data).toEqual(makeData())
	})
})

describe('editorOps: группы', () => {
	it('addGroup создаёт groups и id group-N', () => {
		const data: ImageMapData = { layers: [], objects: [] }
		expect(addGroup(data, 'Кафе')).toEqual({ id: 'group-1', title: 'Кафе' })
		expect(addGroup(data, 'Бары').id).toBe('group-2')
		expect(data.groups).toHaveLength(2)
		const filled = makeData()
		expect(addGroup(filled, 'Новая').id).toBe('group-3')
	})

	it('patchGroup: значения задаются, пустое и undefined удаляют ключ', () => {
		const data = makeData()
		patchGroup(data, 'group-1', { title: 'Рестораны', color: '', icon: 'cup', style: undefined })
		expect(data.groups?.[0]).toEqual({ id: 'group-1', title: 'Рестораны', icon: 'cup' })
	})

	it('patchGroup: нет группы или groups — ничего', () => {
		const data = makeData()
		patchGroup(data, 'missing', { title: 'Нет' })
		expect(data).toEqual(makeData())
		const empty: ImageMapData = { layers: [], objects: [] }
		patchGroup(empty, 'group-1', { title: 'Нет' })
		expect(empty).toEqual({ layers: [], objects: [] })
	})

	it('removeGroup удаляет группу и снимает её с объектов', () => {
		const data = makeData()
		removeGroup(data, 'group-1')
		expect(data.groups?.map(group => group.id)).toEqual(['group-2'])
		expect(data.objects[0]).not.toHaveProperty('group')
		expect(data.objects[2]?.group).toBe('group-2')
	})

	it('removeGroup без groups', () => {
		const data: ImageMapData = {
			layers: [],
			objects: [{ id: 'point-1', title: '', type: 'point', x: 0, y: 0, group: 'group-1' }],
		}
		removeGroup(data, 'group-1')
		expect(data.groups).toBeUndefined()
		expect(data.objects[0]).not.toHaveProperty('group')
	})
})
