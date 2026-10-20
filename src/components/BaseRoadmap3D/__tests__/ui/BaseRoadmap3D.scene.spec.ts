import '@testing-library/jest-dom/vitest'
import { waitFor } from '@testing-library/vue'
import { BoxGeometry, MeshBasicMaterial } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { Model3DDefinitions } from '@/scene3d/types/model3d.types'
import { Color, Group, Mesh, MeshStandardMaterial, ShaderMaterial } from 'three'
import type { RoadmapData } from '@components/BaseRoadmap/types/roadmapData.types'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, stubReducedMotion, useRoadmap3DEnvironment } from '../fixtures/roadmap3d.test-utils'

const env = useRoadmap3DEnvironment()

type Visit = (item: Mesh) => void
type Traversable = { traverse: (visit: (item: unknown) => void) => void }

function meshes(scene: Traversable | undefined, visit: Visit): void {
	scene?.traverse(item => (item as Mesh).isMesh && visit(item as Mesh))
}

function roadProgress(scene: Traversable | undefined): number {
	let value = -1
	meshes(scene, mesh => {
		const material = mesh.material as ShaderMaterial
		if (material.uniforms?.uProgress && mesh.renderOrder === 3) value = material.uniforms.uProgress.value
	})
	return value
}

function carPosition(scene: Traversable | undefined): [number, number, number] {
	let found: Group | null = null
	meshes(scene, mesh => {
		const geometry = mesh.geometry as BoxGeometry
		if (geometry.parameters?.width === 0.56 && geometry.parameters?.depth === 0.94) found = mesh.parent as Group
	})
	const place = (found as unknown as Group | null)?.position
	return place ? [place.x, place.y, place.z] : [NaN, NaN, NaN]
}

const sceneOf = (exposed: { value: { getSceneContext: () => { scene: Traversable } | null } | null }) =>
	exposed.value?.getSceneContext()?.scene

describe('BaseRoadmap3D: прогресс двигает машинку и дорогу', () => {
	it('при «уменьшить движение» дорога и машинка встают сразу на новый прогресс', async () => {
		stubReducedMotion(true)
		const { exposed, rerender } = await env.renderRoadmap()
		env.flush(4)
		const before = roadProgress(sceneOf(exposed))
		const carBefore = carPosition(sceneOf(exposed))
		expect(before).toBeGreaterThan(0)
		await rerender({ progress: { version: 1, topics: { html: { status: 'done' }, css: { status: 'done' }, vue: { status: 'done' } } } })
		env.flush(2)
		expect(roadProgress(sceneOf(exposed))).toBeGreaterThan(before)
		expect(carPosition(sceneOf(exposed))).not.toEqual(carBefore)
	})

	it('без него машинка выезжает кадрами: сначала в начале дороги, потом на своём месте', async () => {
		stubReducedMotion(false)
		const { exposed } = await env.renderRoadmap()
		const first = roadProgress(sceneOf(exposed))
		env.flush(400)
		const last = roadProgress(sceneOf(exposed))
		expect(last).toBeGreaterThan(first)
		const car = carPosition(sceneOf(exposed))
		expect(Number.isFinite(car[0])).toBe(true)
	})

	it('hasCar=false в данных убирает машинку', async () => {
		const data: RoadmapData = { ...DATA_ROADMAP_3D, view3d: { hasCar: false } }
		const { exposed } = await env.renderRoadmap({ data })
		let visible = true
		meshes(sceneOf(exposed), mesh => {
			const geometry = mesh.geometry as BoxGeometry
			if (geometry.parameters?.width === 0.56) visible = (mesh.parent as Group).visible
		})
		expect(visible).toBe(false)
	})

	it('тема страницы перекрашивает сцену без пересборки', async () => {
		const { renderer } = await env.renderRoadmap()
		const copy = vi.spyOn(Color.prototype, 'copy')
		const calls = renderer.render.mock.calls.length
		document.documentElement.setAttribute('data-theme', 'dark')
		await waitFor(() => expect(copy).toHaveBeenCalled())
		env.flush(2)
		expect(renderer.render.mock.calls.length).toBeGreaterThan(calls)
		document.documentElement.removeAttribute('data-theme')
	})

	it('наведение и фокус красят пьедесталы: сцена перерисовывается', async () => {
		const { exposed, renderer } = await env.renderRoadmap()
		const calls = renderer.render.mock.calls.length
		exposed.value?.focusStage('frame')
		await Promise.resolve()
		env.flush(3)
		expect(renderer.render.mock.calls.length).toBeGreaterThan(calls)
	})
})

describe('BaseRoadmap3D: хуки сцены', () => {
	it('onSceneReady получает сцену, камеру и рендерер; очистка вызывается при пересборке и размонтировании', async () => {
		const cleanup = vi.fn()
		const onSceneReady = vi.fn((_context: unknown) => cleanup)
		const { rerender, unmount, renderer } = await env.renderRoadmap({ onSceneReady, quality: 'high' })
		expect(onSceneReady).toHaveBeenCalledOnce()
		const context = onSceneReady.mock.calls[0][0] as {
			scene: unknown
			camera: unknown
			renderer: unknown
			getModel: (id: string) => unknown
		}
		expect(context.renderer).toBe(renderer)
		expect(context.scene).toBeDefined()
		expect(context.camera).toBeDefined()
		expect(context.getModel('basics')).not.toBeNull()
		await rerender({ quality: 'low' })
		await waitFor(() => expect(onSceneReady).toHaveBeenCalledTimes(2))
		expect(cleanup).toHaveBeenCalledTimes(1)
		unmount()
		expect(cleanup).toHaveBeenCalledTimes(2)
	})

	it('onBeforeRender вызывается перед каждым кадром только если задан', async () => {
		const onBeforeRender = vi.fn()
		const { unmount } = await env.renderRoadmap({ onBeforeRender })
		const first = onBeforeRender.mock.calls.length
		env.flush(3)
		expect(onBeforeRender.mock.calls.length).toBeGreaterThanOrEqual(first)
		expect(onBeforeRender.mock.calls.at(-1)?.[1]).toMatchObject({ delta: expect.any(Number), time: expect.any(Number) })
		unmount()
		const plain = await env.renderRoadmap()
		env.flush(2)
		expect(plain.renderer.render).toHaveBeenCalled()
	})

	it('onModelReady вызывается для моделей этапов', async () => {
		const onModelReady = vi.fn()
		await env.renderRoadmap({ onModelReady })
		await waitFor(() => expect(onModelReady.mock.calls.length).toBeGreaterThanOrEqual(4))
	})

	it('дескриптор модели управляется снаружи: цвет и материал', async () => {
		const { exposed } = await env.renderRoadmap()
		const handle = exposed.value?.getModel('basics')
		expect(handle).toBeTruthy()
		expect(() => handle?.setColor('#ff0000', 'body')).not.toThrow()
		const custom = new MeshStandardMaterial()
		expect(() => handle?.setMaterial('body', custom)).not.toThrow()
		expect(() => handle?.setMaterial('body', null)).not.toThrow()
		custom.dispose()
	})
})

describe('BaseRoadmap3D: свои модели и общий кеш GLB', () => {
	function gltfScene(): Group {
		const scene = new Group()
		scene.add(new Mesh(new BoxGeometry(), new MeshBasicMaterial()))
		return scene
	}

	it('один адрес GLB у нескольких этапов грузится один раз', async () => {
		const load = vi
			.spyOn(GLTFLoader.prototype, 'loadAsync')
			.mockImplementation((() => Promise.resolve({ scene: gltfScene(), animations: [] })) as never)
		const data: RoadmapData = {
			...DATA_ROADMAP_3D,
			stages: DATA_ROADMAP_3D.stages.map(stage => ({ ...stage, model3d: { url: 'shared.glb' } })),
		}
		await env.renderRoadmap({ data })
		await waitFor(() => expect(load).toHaveBeenCalled())
		await new Promise(resolve => setTimeout(resolve, 50))
		expect(load).toHaveBeenCalledTimes(1)
		expect(load).toHaveBeenCalledWith('shared.glb')
	})

	it('configureLoader получает загрузчик', async () => {
		vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockImplementation((() =>
			Promise.resolve({ scene: gltfScene(), animations: [] })) as never)
		const configureLoader = vi.fn()
		const data: RoadmapData = { ...DATA_ROADMAP_3D, stages: [{ id: 'a', title: 'A', topics: [], model3d: { url: 'a.glb' } }] }
		await env.renderRoadmap({ data, configureLoader })
		await waitFor(() => expect(configureLoader).toHaveBeenCalledWith(expect.any(GLTFLoader)))
	})

	it('ошибка загрузки GLB не ломает остров: предупреждение и запасная модель', async () => {
		vi.spyOn(GLTFLoader.prototype, 'loadAsync').mockRejectedValue(new Error('404'))
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const data: RoadmapData = { ...DATA_ROADMAP_3D, stages: [{ id: 'a', title: 'A', topics: [], model3d: { url: 'bad.glb' } }] }
		const { exposed } = await env.renderRoadmap({ data })
		await waitFor(() => expect(warn).toHaveBeenCalled())
		expect(exposed.value?.getModel('a')).not.toBeNull()
	})

	it('models: встроенная модель под своим ключом и фабрика приложения', async () => {
		const models: Model3DDefinitions = {
			custom: { model: 'gear' } as never,
			factory: (() => ({ object: new Group() })) as never,
		}
		const data: RoadmapData = {
			...DATA_ROADMAP_3D,
			stages: [
				{ id: 'a', title: 'A', topics: [], model3d: { model: 'custom' } },
				{ id: 'b', title: 'B', topics: [], model3d: { model: 'factory' } },
			],
		}
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { exposed } = await env.renderRoadmap({ data, models })
		expect(exposed.value?.getModels()).toHaveLength(2)
		warn.mockRestore()
	})
})

describe('BaseRoadmap3D: данные и прогресс как у BaseRoadmap', () => {
	it('прогресс снаружи сообщает update:progress при отметке темы через ref', async () => {
		const { exposed, events } = await env.renderRoadmap({ progress: PROGRESS_ROADMAP_3D })
		exposed.value?.setTopicStatus('vue', 'done')
		await waitFor(() => expect(events['update:progress']?.length).toBeGreaterThan(0))
	})
})
