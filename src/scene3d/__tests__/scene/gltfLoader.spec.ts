import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { AnimationClip, BoxGeometry, Group, Mesh, MeshBasicMaterial } from 'three'
import { createModelLibrary, loadLayerModel, placeModel, findModelNode } from '../../scene/gltfLoader'

function modelScene(): Group {
	const scene = new Group()
	scene.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial()))
	return scene
}

function stubLoad(impl: (url: string) => Promise<{ scene: Group; animations?: AnimationClip[] }>) {
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
		expect(first.object).not.toBe(second.object)
		expect(first.object.children).toHaveLength(1)
		expect((first.object.children[0] as Mesh).geometry).toBe((second.object.children[0] as Mesh).geometry)
		expect(first.clips).toEqual([])
	})

	it('клипы файла отдаются вместе с клоном, общими для всех клонов', async () => {
		const clip = new AnimationClip('spin', 1, [])
		stubLoad(async () => ({ scene: modelScene(), animations: [clip] }))
		const library = createModelLibrary()
		const [first, second] = [await library.load('a.glb'), await library.load('a.glb')]
		expect(first.clips).toEqual([clip])
		expect(second.clips[0]).toBe(clip)
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
		await expect(library.load('a.glb')).resolves.toMatchObject({ object: expect.any(Group) })
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

	it('dispose при незавершённой загрузке, которая упадёт, не падает сам', async () => {
		stubLoad(async () => {
			throw new Error('сломан')
		})
		const library = createModelLibrary()
		const pending = library.load('a.glb')
		const disposing = library.dispose()
		await expect(pending).rejects.toThrow('сломан')
		await expect(disposing).resolves.toBeUndefined()
	})

	it('kiosk.glb читается: узлы Body, Screen, Lamp, Flap, клип Open у каждого клона', async () => {
		const file = readFileSync(resolve(process.cwd(), 'src/components/BaseFlowMap3D/stories/assets/kiosk.glb'))
		const buffer = new ArrayBuffer(file.byteLength)
		new Uint8Array(buffer).set(file)
		vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockImplementation(function (this: GLTFLoader) {
			return this.parseAsync(buffer, '')
		})
		const library = createModelLibrary()
		const [first, second] = [await library.load('kiosk.glb'), await library.load('kiosk.glb')]
		const names: string[] = []
		first.object.traverse(item => names.push(item.name))
		expect(names).toEqual(expect.arrayContaining(['Body', 'Screen', 'Lamp', 'Flap']))
		expect(first.clips.map(clip => clip.name)).toEqual(['Open'])
		expect(second.clips[0]).toBe(first.clips[0])
		expect(second.object).not.toBe(first.object)
	})
})
