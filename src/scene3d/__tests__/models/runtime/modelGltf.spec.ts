import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { flush } from '../modelsTestHelpers'
import { MODEL3D_LIBRARY } from '../../../models/library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createGltfLoader, gltfToInstance } from '../../../models/runtime/modelGltf'
import type { Model3DGltfSource } from '../../../types/internal/model3dInternal.types'
import { createTestContext, createTestRegistry, node, runFrames } from '../modelsTestKit'
import { AnimationClip, AnimationMixer, BoxGeometry, Group, Mesh, MeshStandardMaterial } from 'three'

function fakeScene(): Group {
	const scene = new Group()
	scene.add(new Mesh(new BoxGeometry(2, 1, 4), new MeshStandardMaterial({ color: '#336699' })))
	scene.children[0].position.set(10, 5, -3)
	return scene
}

function fakeGltf(): GLTF {
	return { scene: fakeScene(), animations: [new AnimationClip('Open', 1, [])] } as unknown as GLTF
}

function stubLoad(factory: (url: string) => Promise<GLTF> | GLTF) {
	return vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockImplementation(async url => factory(url))
}

afterEach(() => vi.restoreAllMocks())

describe('createGltfLoader', () => {
	it('кеш по адресу: один файл на два узла, каждому свой клон, клипы общие', async () => {
		const load = stubLoad(() => fakeGltf())
		const loader = createGltfLoader()
		const [a, b] = await Promise.all([loader.load('a.glb'), loader.load('a.glb')])
		expect(load).toHaveBeenCalledTimes(1)
		expect(a.object).not.toBe(b.object)
		expect(a.object.children[0]).not.toBe(b.object.children[0])
		expect((a.object.children[0] as Mesh).geometry).toBe((b.object.children[0] as Mesh).geometry)
		expect(a.clips.map(clip => clip.name)).toEqual(['Open'])
		await loader.load('b.glb')
		expect(load).toHaveBeenCalledTimes(2)
	})

	it('configure получает загрузчик до загрузки', async () => {
		stubLoad(() => fakeGltf())
		const configure = vi.fn()
		await createGltfLoader(configure).load('a.glb')
		expect(configure).toHaveBeenCalledWith(expect.any(GLTFLoader))
	})

	it('ошибка не кешируется: следующий вызов пробует снова', async () => {
		let attempt = 0
		const load = stubLoad(async () => {
			attempt += 1
			if (attempt === 1) throw new Error('нет сети')
			return fakeGltf()
		})
		const loader = createGltfLoader()
		await expect(loader.load('a.glb')).rejects.toThrow('нет сети')
		await expect(loader.load('a.glb')).resolves.toMatchObject({ clips: expect.any(Array) })
		expect(load).toHaveBeenCalledTimes(2)
	})

	it('dispose освобождает оригиналы и очищает кеш', async () => {
		const gltf = fakeGltf()
		stubLoad(() => gltf)
		const loader = createGltfLoader()
		await loader.load('a.glb')
		const mesh = gltf.scene.children[0] as Mesh
		const geometry = vi.spyOn(mesh.geometry, 'dispose')
		const material = vi.spyOn(mesh.material as MeshStandardMaterial, 'dispose')
		await loader.dispose()
		expect(geometry).toHaveBeenCalled()
		expect(material).toHaveBeenCalled()
		await loader.load('a.glb')
	})

	it('dispose при незавершённой загрузке, которая упадёт, не падает сам', async () => {
		stubLoad(async () => {
			throw new Error('сломан')
		})
		const loader = createGltfLoader()
		const pending = loader.load('a.glb')
		const disposing = loader.dispose()
		await expect(pending).rejects.toThrow()
		await expect(disposing).resolves.toBeUndefined()
	})

	it('kiosk.glb читается загрузчиком: узлы Body, Screen, Lamp, Flap, клип Open', async () => {
		const file = readFileSync(resolve(process.cwd(), 'src/components/BaseFlowMap3D/stories/assets/kiosk.glb'))
		const buffer = new ArrayBuffer(file.byteLength)
		new Uint8Array(buffer).set(file)
		vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockImplementation(function (this: GLTFLoader) {
			return this.parseAsync(buffer, '')
		})
		const source = await createGltfLoader().load('kiosk.glb')
		const names: string[] = []
		source.object.traverse(item => names.push(item.name))
		expect(names).toEqual(expect.arrayContaining(['Body', 'Screen', 'Lamp', 'Flap']))
		expect(source.clips.map(clip => clip.name)).toEqual(['Open'])
	})
})

describe('gltfToInstance', () => {
	const source = (): Model3DGltfSource => ({ object: fakeScene(), clips: [] })
	const wrapperOf = (object: Group) => object.children[0]

	it('fit footprint по умолчанию: ширина клетки × 0,9 и модель стоит на земле, по центру', () => {
		const { object } = gltfToInstance(source(), { url: 'a.glb' }, createTestContext())
		const wrapper = wrapperOf(object as Group)
		expect(wrapper.scale.x).toBeCloseTo((1.6 * 0.9) / 4)
		const inner = wrapper.children[0]
		expect(inner.position.toArray().map(value => Math.round(value * 1000) / 1000)).toEqual([-10, -4.5, 3])
	})

	it('fit none: размер как в файле', () => {
		const { object } = gltfToInstance(source(), { url: 'a.glb', fit: 'none' }, createTestContext())
		expect(wrapperOf(object as Group).scale.x).toBe(1)
		expect(wrapperOf(object as Group).children[0].position.toArray()).toEqual([0, 0, 0])
	})

	it('scale, rotationY и offset определения', () => {
		const { object } = gltfToInstance(
			source(),
			{ url: 'a.glb', fit: 'none', scale: 2, rotationY: 90, offset: [1, 2, 3] },
			createTestContext(),
		)
		const wrapper = wrapperOf(object as Group)
		expect(wrapper.scale.x).toBe(2)
		expect(wrapper.rotation.y).toBeCloseTo(Math.PI / 2)
		expect(wrapper.position.toArray()).toEqual([1, 2, 3])
	})

	it('scale умножается на вписанный размер', () => {
		const { object } = gltfToInstance(source(), { url: 'a.glb', scale: 2 }, createTestContext())
		expect(wrapperOf(object as Group).scale.x).toBeCloseTo(2 * ((1.6 * 0.9) / 4))
	})

	it('пустая по размеру модель не масштабируется', () => {
		const flat = new Group()
		flat.add(new Mesh(new BoxGeometry(0, 0, 0)))
		const { object } = gltfToInstance({ object: flat, clips: [] }, { url: 'a.glb' }, createTestContext())
		expect(wrapperOf(object as Group).scale.x).toBe(1)
	})

	it('paint state (по умолчанию): материалы кита по parts, остальное — body', () => {
		const scene = new Group()
		const body = new Mesh(new BoxGeometry())
		const screen = new Mesh(new BoxGeometry())
		screen.name = 'Screen'
		const holder = new Group()
		holder.name = 'Lamp holder'
		const lamp = new Mesh(new BoxGeometry())
		holder.add(lamp)
		scene.add(body, screen, holder)
		const materials: Record<string, MeshStandardMaterial> = {}
		const context = createTestContext({
			material: part => (materials[part] ??= new MeshStandardMaterial({ name: part })),
		})
		const instance = gltfToInstance(
			{ object: scene, clips: [] },
			{ url: 'a.glb', parts: { screen: 'Screen', light: 'Lamp holder', metal: 'Nothing' } },
			context,
		)
		expect(screen.material).toBe(materials.screen)
		expect(lamp.material).toBe(materials.light)
		expect(body.material).toBe(materials.body)
		expect(instance.parts?.screen).toEqual([screen])
		expect(instance.parts?.light).toEqual([lamp])
		expect(instance.parts?.metal).toEqual([])
		expect(instance.parts?.body).toEqual([body])
	})

	it('в parts можно назвать и body: к нему добавляются остальные меши', () => {
		const scene = new Group()
		const named = new Mesh(new BoxGeometry())
		named.name = 'Shell'
		const rest = new Mesh(new BoxGeometry())
		scene.add(named, rest)
		const instance = gltfToInstance({ object: scene, clips: [] }, { url: 'a.glb', parts: { body: 'Shell' } }, createTestContext())
		expect(instance.parts?.body).toEqual([named, rest])
	})

	it('paint keep: материалы файла остаются, частей нет', () => {
		const scene = fakeScene()
		const material = (scene.children[0] as Mesh).material
		const instance = gltfToInstance({ object: scene, clips: [] }, { url: 'a.glb', paint: 'keep' }, createTestContext())
		expect((scene.children[0] as Mesh).material).toBe(material)
		expect(instance.parts).toBeUndefined()
	})
})

describe('GLB в реестре', () => {
	const model = (extra = {}) => ({ k: { url: 'k.glb', ...extra } })
	const setup = (options: Parameters<typeof createTestRegistry>[0] = {}) => {
		const warn = vi.fn()
		const onModelReady = vi.fn()
		const made = createTestRegistry({ warn, onModelReady, ...options })
		return { ...made, warn, onModelReady }
	}
	const bodyHolds = (registry: ReturnType<typeof createTestRegistry>['registry'], id: string) =>
		registry.getHandle(id)!.object.children[0].children.length > 0

	it('кеш по адресу на уровне компонента: два узла — одна загрузка', async () => {
		const load = stubLoad(() => fakeGltf())
		const { registry, onModelReady } = setup({ getModels: () => model() })
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'k' } })
		registry.add('b', { node: node('b', 'x'), model3d: { url: 'k.glb' } })
		registry.commit()
		await flush()
		expect(load).toHaveBeenCalledTimes(1)
		expect(bodyHolds(registry, 'a') && bodyHolds(registry, 'b')).toBe(true)
		expect(onModelReady).toHaveBeenCalledTimes(2)
		expect(registry.getHandle('a')!.preset).toBeNull()
		registry.dispose()
	})

	it('собственный загрузчик освобождается с реестром', async () => {
		const gltf = fakeGltf()
		stubLoad(() => gltf)
		const { registry } = setup()
		registry.add('a', { node: node('a', 'x'), model3d: { url: 'k.glb' } })
		registry.commit()
		await flush()
		const geometry = vi.spyOn((gltf.scene.children[0] as Mesh).geometry, 'dispose')
		registry.dispose()
		await flush()
		expect(geometry).toHaveBeenCalled()
	})

	it('загрузчик из опций не освобождается реестром', async () => {
		const dispose = vi.fn(async () => undefined)
		const load = vi.fn(async () => ({ object: fakeScene(), clips: [] }))
		const { registry } = setup({ gltf: { load, dispose } })
		registry.add('a', { node: node('a', 'x'), model3d: { url: 'k.glb' } })
		registry.commit()
		await flush()
		expect(load).toHaveBeenCalledWith('k.glb')
		registry.dispose()
		expect(dispose).not.toHaveBeenCalled()
	})

	it('пока файл грузится, повторный commit его не перезапускает', async () => {
		const load = vi.fn(async () => ({ object: fakeScene(), clips: [] }))
		const { registry } = setup({ gltf: { load, dispose: async () => undefined } })
		registry.add('a', { node: node('a', 'x'), model3d: { url: 'k.glb' } })
		registry.commit()
		registry.commit()
		await flush()
		expect(load).toHaveBeenCalledTimes(1)
	})

	it('ответ после remove отбрасывается', async () => {
		let release: (value: Model3DGltfSource) => void = () => undefined
		const load = vi.fn(() => new Promise<Model3DGltfSource>(resolve => (release = resolve)))
		const { registry, onModelReady } = setup({ gltf: { load, dispose: async () => undefined } })
		const root = registry.add('a', { node: node('a', 'x'), model3d: { url: 'k.glb' } })
		registry.commit()
		registry.remove('a')
		release({ object: fakeScene(), clips: [] })
		await flush()
		expect(root.children[0].children).toHaveLength(0)
		expect(onModelReady).not.toHaveBeenCalled()
	})

	it('ответ после update отбрасывается, новая сборка идёт своим чередом', async () => {
		const resolvers: Array<(value: Model3DGltfSource) => void> = []
		const load = vi.fn(() => new Promise<Model3DGltfSource>(resolve => resolvers.push(resolve)))
		const { registry } = setup({ gltf: { load, dispose: async () => undefined } })
		registry.add('a', { node: node('a', 'x'), model3d: { url: 'one.glb' } })
		registry.commit()
		registry.update('a', { node: node('a', 'x'), model3d: { url: 'two.glb' } })
		registry.commit()
		resolvers[0]({ object: fakeScene(), clips: [] })
		await flush()
		expect(bodyHolds(registry, 'a')).toBe(false)
		resolvers[1]({ object: fakeScene(), clips: [] })
		await flush()
		expect(bodyHolds(registry, 'a')).toBe(true)
	})

	it('ошибка загрузки: server на месте узла и warn', async () => {
		const load = vi.fn(async () => {
			throw new Error('404')
		})
		const { registry, warn, onModelReady } = setup({ gltf: { load, dispose: async () => undefined } })
		registry.add('a', { node: node('a', 'x'), model3d: { url: 'k.glb' } })
		registry.commit()
		await flush()
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('k.glb')
		expect(bodyHolds(registry, 'a')).toBe(true)
		expect(onModelReady).toHaveBeenCalledTimes(1)
	})

	it('ошибка устаревшей загрузки молчит', async () => {
		let fail: (error: Error) => void = () => undefined
		const load = vi.fn(() => new Promise<Model3DGltfSource>((_resolve, reject) => (fail = reject)))
		const { registry, warn } = setup({ gltf: { load, dispose: async () => undefined } })
		registry.add('a', { node: node('a', 'x'), model3d: { url: 'k.glb' } })
		registry.commit()
		registry.remove('a')
		fail(new Error('поздно'))
		await flush()
		expect(warn).not.toHaveBeenCalled()
	})

	it('клипы определения → AnimationMixer: play берёт клип, прогресс ставит время', async () => {
		const update = vi.spyOn(AnimationMixer.prototype, 'update')
		const clip = new AnimationClip('OpenClip', 2, [])
		const load = vi.fn(async () => ({ object: fakeScene(), clips: [clip] }))
		const { registry, loop, warn } = setup({
			gltf: { load, dispose: async () => undefined },
			getDuration: () => 1000,
			getModels: () => model({ clips: { gate: 'OpenClip', scan: 'Missing' } }),
		})
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'k' } })
		registry.commit()
		await flush()
		const done = registry.getHandle('a')!.play('gate')
		runFrames(loop, 5, 0.1)
		expect(update).toHaveBeenCalledWith(0)
		runFrames(loop, 6, 0.1)
		await done
		expect(warn).not.toHaveBeenCalled()
		await registry.getHandle('a')!.play('scan')
		expect(warn).toHaveBeenCalledTimes(1)
		registry.remove('a')
	})

	it('без clips mixer не заводится: клип недоступен', async () => {
		const load = vi.fn(async () => ({ object: fakeScene(), clips: [new AnimationClip('Open', 1, [])] }))
		const { registry, warn } = setup({ gltf: { load, dispose: async () => undefined }, getModels: () => model() })
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'k' } })
		registry.commit()
		await flush()
		await registry.getHandle('a')!.play('gate')
		expect(warn).toHaveBeenCalledTimes(1)
	})

	it('paint и parts определения доходят до материалов кита', async () => {
		const scene = new Group()
		const screen = new Mesh(new BoxGeometry())
		screen.name = 'Screen'
		const body = new Mesh(new BoxGeometry())
		scene.add(screen, body)
		const load = vi.fn(async () => ({ object: scene, clips: [] }))
		const { registry } = setup({
			gltf: { load, dispose: async () => undefined },
			getModels: () => model({ parts: { screen: 'Screen' } }),
			library: MODEL3D_LIBRARY,
		})
		registry.add('a', { node: node('a', 'x'), model3d: { model: 'k' } })
		registry.commit()
		await flush()
		expect((screen.material as MeshStandardMaterial).userData.part).toBe('screen')
		expect((body.material as MeshStandardMaterial).userData.part).toBe('body')
		const shared = screen.material
		registry.getHandle('a')!.setState({ isHovered: true })
		expect(screen.material).not.toBe(shared)
	})
})
