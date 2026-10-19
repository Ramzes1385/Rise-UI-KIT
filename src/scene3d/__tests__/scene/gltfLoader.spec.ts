import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { BoxGeometry, Group, Mesh, MeshBasicMaterial } from 'three'
import { createModelLibrary, loadLayerModel, placeModel, findModelNode } from '../../scene/gltfLoader'

function modelScene(): Group {
	const scene = new Group()
	scene.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial()))
	return scene
}

function stubLoad(impl: (url: string) => Promise<{ scene: Group }>) {
	return vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockImplementation(impl as never)
}

describe('placeModel и findModelNode', () => {
	it('масштаб, сдвиг и поворот; неверные поля — умолчания', () => {
		const root = placeModel(new Group(), { scale: 2, position: [1, 2, 3], rotationY: 90 })
		expect([root.scale.x, ...root.position.toArray()]).toEqual([2, 1, 2, 3])
		expect(root.rotation.y).toBeCloseTo(Math.PI / 2)
		const plain = placeModel(new Group(), { scale: 0, position: [1, 2] as never })
		expect([plain.scale.x, plain.position.x, plain.rotation.y]).toEqual([1, 0, 0])
	})

	it('узел находится по имени и по очищенному имени', () => {
		const root = new Group()
		const node = new Group()
		node.name = 'Cafe_Main'
		root.add(node)
		expect(findModelNode(root, 'Cafe Main')).toBe(node)
		expect(findModelNode(root, 'нет')).toBeUndefined()
	})
})

describe('loadLayerModel', () => {
	it('configure получает загрузчик, модель размещается', async () => {
		const load = stubLoad(async () => ({ scene: modelScene() }))
		const configure = vi.fn()
		const root = await loadLayerModel({ url: 'a.glb', scale: 3 }, configure)
		expect(configure).toHaveBeenCalledWith(expect.any(GLTFLoader))
		expect(load).toHaveBeenCalledWith('a.glb')
		expect(root.scale.x).toBe(3)
	})
})

describe('createModelLibrary', () => {
	it('адрес грузится один раз, каждому вызову достаётся свой клон', async () => {
		const load = stubLoad(async () => ({ scene: modelScene() }))
		const library = createModelLibrary()
		const [first, second] = [await library.load('a.glb'), await library.load('a.glb')]
		expect(load).toHaveBeenCalledTimes(1)
		expect(first).not.toBe(second)
		expect(first.children).toHaveLength(1)
		expect((first.children[0] as Mesh).geometry).toBe((second.children[0] as Mesh).geometry)
	})

	it('параллельные запросы одного адреса делят одну загрузку; другой адрес — отдельная', async () => {
		const load = stubLoad(async () => ({ scene: modelScene() }))
		const library = createModelLibrary()
		await Promise.all([library.load('a.glb'), library.load('a.glb')])
		await library.load('b.glb')
		expect(load).toHaveBeenCalledTimes(2)
	})

	it('configure применяется к загрузчику', async () => {
		stubLoad(async () => ({ scene: modelScene() }))
		const configure = vi.fn()
		await createModelLibrary(configure).load('a.glb')
		expect(configure).toHaveBeenCalledTimes(1)
	})

	it('ошибка загрузки не кешируется: повтор грузит заново', async () => {
		const load = stubLoad(async () => {
			throw new Error('404')
		})
		const library = createModelLibrary()
		await expect(library.load('a.glb')).rejects.toThrow('404')
		await Promise.resolve()
		load.mockImplementation((async () => ({ scene: modelScene() })) as never)
		await expect(library.load('a.glb')).resolves.toBeInstanceOf(Group)
		expect(load).toHaveBeenCalledTimes(2)
	})

	it('dispose освобождает оригиналы, пропуская неудавшиеся, и очищает кеш', async () => {
		const scene = modelScene()
		const geometry = (scene.children[0] as Mesh).geometry
		const load = stubLoad(async (url: string) => {
			if (url === 'bad.glb') throw new Error('x')
			return { scene }
		})
		const library = createModelLibrary()
		await library.load('a.glb')
		await library.load('bad.glb').catch(() => undefined)
		const dispose = vi.spyOn(geometry, 'dispose')
		await library.dispose()
		expect(dispose).toHaveBeenCalled()
		await library.load('a.glb')
		expect(load).toHaveBeenCalledTimes(3)
	})
})
