import { applyLayerMode } from '../../../model/scene/sceneState'
import { buildSceneContent } from '../../../model/scene/buildScene'
import { attachModel } from '../../../model/scene/gltf/attachModel'
import type { ImageMap3DData } from '../../../types/imageMap3dData.types'
import { BoxGeometry, Color, Group, Mesh, MeshStandardMaterial } from 'three'
import { findModelNode, loadLayerModel, placeModel } from '@/scene3d/scene/gltfLoader'

const resolve = (css: string): Color => new Color(css.startsWith('var(') ? '#336699' : css)

const DATA: ImageMap3DData = {
	layers: [{ id: 'mall', title: 'ТЦ', width: 1000, height: 600, model: { url: 'mall.glb' } }],
	objects: [
		{ id: 'shop-1', type: 'svg', title: 'Магазин 1', elementId: 'shop-1' },
		{ id: 'cafe', type: 'rect', title: 'Кафе', x: 0.1, y: 0.1, width: 0.1, height: 0.1, meshName: 'Cafe Main' },
		{ id: 'kiosk', type: 'rect', title: 'Киоск', x: 0.5, y: 0.5, width: 0.1, height: 0.1 },
		{ id: 'ghost', type: 'svg', title: 'Призрак', elementId: 'ghost' },
		{ id: 'info', type: 'point', title: 'Справочная', x: 0.5, y: 0.5 },
		{ id: 'other', type: 'rect', title: 'Другой этаж', x: 0, y: 0, width: 0.1, height: 0.1, layer: 'nope' },
	],
}

function mesh(name: string, material = new MeshStandardMaterial()): Mesh {
	const item = new Mesh(new BoxGeometry(10, 10, 10), material)
	item.name = name
	return item
}

function modelRoot() {
	const shared = new MeshStandardMaterial({ opacity: 0.5 })
	const replaced = new MeshStandardMaterial()
	const shop = new Group()
	shop.name = 'shop-1'
	shop.add(mesh('shop-1-walls', replaced), mesh('shop-1-roof', replaced))
	const root = new Group()
	root.add(shop, mesh('Cafe_Main'), mesh('slab', shared), mesh('info'))
	return { root, shared, replaced }
}

describe('модель этажа', () => {
	it('placeModel: масштаб, сдвиг и поворот; неверные поля — умолчания', () => {
		const root = placeModel(new Group(), { url: 'a.glb', scale: 2, position: [1, 2, 3], rotationY: 90 })
		expect(root.scale.toArray()).toEqual([2, 2, 2])
		expect(root.position.toArray()).toEqual([1, 2, 3])
		expect(root.rotation.y).toBeCloseTo(Math.PI / 2)
		const plain = placeModel(new Group(), { url: 'a.glb', scale: -1, position: [1, Number.NaN, 3] as never, rotationY: 'x' as never })
		expect([plain.scale.x, plain.position.x, plain.rotation.y]).toEqual([1, 0, 0])
	})

	it('findModelNode: по имени и по имени, очищенному GLTFLoader (пробелы → _)', () => {
		const { root } = modelRoot()
		expect(findModelNode(root, 'shop-1')?.name).toBe('shop-1')
		expect(findModelNode(root, 'Cafe Main')?.name).toBe('Cafe_Main')
		expect(findModelNode(root, 'none')).toBeUndefined()
	})

	it('loadLayerModel: configureLoader получает загрузчик до загрузки; сцена модели размещается', async () => {
		const scene = new Group()
		const configure = vi.fn(loader => {
			loader.loadAsync = vi.fn(async () => ({ scene }))
		})
		const root = await loadLayerModel({ url: 'mall.glb', scale: 3 }, configure)
		expect(configure).toHaveBeenCalledOnce()
		expect(configure.mock.calls[0][0].loadAsync).toHaveBeenCalledWith('mall.glb')
		expect(root).toBe(scene)
		expect(root.scale.x).toBe(3)
	})

	it('loadLayerModel без configureLoader загружает адрес модели', async () => {
		await expect(loadLayerModel({ url: 'data:application/octet-stream;base64,AAAA' })).rejects.toBeDefined()
	})

	it('attachModel: меши объектов по meshName ?? id, остальные объекты выдавливаются, точки пропускаются', () => {
		const content = buildSceneContent(DATA, resolve)
		const { root, shared, replaced } = modelRoot()
		const disposeReplaced = vi.spyOn(replaced, 'dispose')
		const disposeShared = vi.spyOn(shared, 'dispose')
		const result = attachModel(content, { data: DATA, layerId: 'mall', root }, resolve)
		expect(result).toEqual({ missing: ['kiosk', 'ghost'], shared: [] })
		expect(content.objects.get('shop-1')).toMatchObject({ source: 'model', layerId: 'mall' })
		expect(content.objects.get('shop-1')?.meshes.map(item => item.name)).toEqual(['shop-1-walls', 'shop-1-roof'])
		expect(content.objects.get('cafe')?.meshes.map(item => item.name)).toEqual(['Cafe_Main'])
		expect(content.objects.get('kiosk')?.source).toBe('shape')
		expect(content.objects.has('ghost')).toBe(false)
		expect(content.objects.has('info')).toBe(false)
		expect(disposeReplaced).toHaveBeenCalledOnce()
		expect(disposeShared).not.toHaveBeenCalled()
		const layer = content.layers.get('mall')
		expect(layer?.modelMaterials).toHaveLength(2)
		expect(layer?.group.children).toContain(root)
		applyLayerMode(content, 'other', 'stack')
		expect(shared.opacity).toBeCloseTo(0.125)
		expect(shared.depthWrite).toBe(false)
		applyLayerMode(content, 'mall', 'stack')
		expect(shared.opacity).toBe(0.5)
		const plain = layer?.modelMaterials.find(material => material !== shared) as MeshStandardMaterial
		expect([plain.opacity, plain.depthWrite]).toEqual([1, true])
	})

	it('attachModel: контур мешей модели — только при явном scene3d.outline: true', () => {
		const linesOf = (data: ImageMap3DData) => {
			const content = buildSceneContent(data, resolve)
			attachModel(content, { data, layerId: 'mall', root: modelRoot().root }, resolve)
			return content.objects.get('shop-1')?.lines.length
		}
		expect(linesOf(DATA)).toBe(0)
		expect(linesOf({ ...DATA, scene3d: { outline: false } })).toBe(0)
		expect(linesOf({ ...DATA, scene3d: { outline: true } })).toBe(2)
	})

	it('attachModel: неизвестный этаж или этаж без слоя в данных — ничего', () => {
		const content = buildSceneContent(DATA, resolve)
		expect(attachModel(content, { data: DATA, layerId: 'nope', root: new Group() }, resolve)).toEqual({ missing: [], shared: [] })
		expect(attachModel(content, { data: { ...DATA, layers: [] }, layerId: 'mall', root: new Group() }, resolve)).toEqual({
			missing: [],
			shared: [],
		})
	})

	it('attachModel: занятые меши не переназначаются — общий meshName и вложенный узел', () => {
		const data: ImageMap3DData = {
			layers: [{ id: 'mall', title: 'ТЦ', width: 1000, height: 600, model: { url: 'mall.glb' } }],
			objects: [
				{ id: 'hall', type: 'rect', title: 'Зал', x: 0, y: 0, width: 0.5, height: 0.5 },
				{ id: 'twin', type: 'rect', title: 'Двойник', x: 0.5, y: 0.5, width: 0.1, height: 0.1, meshName: 'hall' },
				{ id: 'stand', type: 'rect', title: 'Стенд', x: 0.2, y: 0.2, width: 0.1, height: 0.1 },
			],
		}
		const hall = new Group()
		hall.name = 'hall'
		const stand = mesh('stand')
		hall.add(mesh('hall-floor'), stand)
		const root = new Group()
		root.add(hall)
		const content = buildSceneContent(data, resolve)
		const dispose = vi.spyOn(MeshStandardMaterial.prototype, 'dispose')
		const result = attachModel(content, { data, layerId: 'mall', root }, resolve)
		expect(result).toEqual({ missing: [], shared: ['stand', 'twin'] })
		const hallEntry = content.objects.get('hall')
		expect(hallEntry?.meshes.map(item => item.name)).toEqual(['hall-floor', 'stand'])
		expect(stand.material).toBe(hallEntry?.material)
		expect(stand.userData.objectId).toBe('hall')
		expect(content.objects.get('twin')?.source).toBe('shape')
		expect(content.objects.get('stand')?.source).toBe('shape')
		expect(dispose.mock.contexts).not.toContain(hallEntry?.material)
	})

	it('attachModel: общий meshName не зависит от порядка — узел достаётся объекту с тем же id', () => {
		const data: ImageMap3DData = {
			layers: [{ id: 'mall', title: 'ТЦ', width: 1000, height: 600, model: { url: 'mall.glb' } }],
			objects: [
				{ id: 'twin', type: 'rect', title: 'Двойник', x: 0.5, y: 0.5, width: 0.1, height: 0.1, meshName: 'hall' },
				{ id: 'hall', type: 'rect', title: 'Зал', x: 0, y: 0, width: 0.5, height: 0.5, meshName: 'hall' },
				{ id: 'echo', type: 'rect', title: 'Эхо', x: 0.6, y: 0.6, width: 0.1, height: 0.1, meshName: 'hall' },
			],
		}
		const root = new Group()
		root.add(mesh('hall'))
		const content = buildSceneContent(data, resolve)
		expect(attachModel(content, { data, layerId: 'mall', root }, resolve)).toEqual({ missing: [], shared: ['twin', 'echo'] })
		expect(content.objects.get('hall')?.source).toBe('model')
		expect(content.objects.get('twin')?.source).toBe('shape')
		expect(content.objects.get('echo')?.source).toBe('shape')
	})

	it('attachModel: узел занят частично — объект берёт только свободные меши', () => {
		const data: ImageMap3DData = {
			layers: [{ id: 'mall', title: 'ТЦ', width: 1000, height: 600, model: { url: 'mall.glb' } }],
			objects: [
				{ id: 'roof', type: 'rect', title: 'Крыша', x: 0, y: 0, width: 0.5, height: 0.5 },
				{ id: 'block', type: 'rect', title: 'Корпус', x: 0, y: 0, width: 0.5, height: 0.5 },
			],
		}
		const block = new Group()
		block.name = 'block'
		const roof = mesh('roof')
		block.add(roof, mesh('walls'))
		const root = new Group()
		root.add(block)
		const content = buildSceneContent(data, resolve)
		expect(attachModel(content, { data, layerId: 'mall', root }, resolve)).toEqual({ missing: [], shared: ['block'] })
		expect(content.objects.get('roof')?.meshes).toEqual([roof])
		expect(content.objects.get('block')?.meshes.map(item => item.name)).toEqual(['walls'])
	})

	it('модель без baseOpacity считается непрозрачной', () => {
		const content = buildSceneContent(DATA, resolve)
		const layer = content.layers.get('mall')
		const material = new MeshStandardMaterial()
		if (layer) layer.modelMaterials = [material]
		applyLayerMode(content, 'x', 'stack')
		expect(material.opacity).toBe(0.25)
	})
})
