import '@testing-library/jest-dom/vitest'
import { render, waitFor } from '@testing-library/vue'
import BaseImageMap3D from '../../ui/BaseImageMap3D.vue'
import type { Camera, Material as ThreeMaterial, Scene } from 'three'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'
import { BufferGeometry, Material, Mesh, Texture, TextureLoader } from 'three'
import { createFakeRenderer, TestResizeObserver, useMapEnvironment } from '../imageMap3d.test-utils'

const SVG = (id: string) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect id="${id}" x="100" y="100" width="200" height="100"/><path id="${id}-l" d="M400 100h200v100H400z"/></svg>`

const RICH: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', image: 'plan-1.png', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', svg: SVG('hall'), width: 800, height: 400, elevation: 200 },
	],
	objects: [
		{ id: 'shop', type: 'rect', title: 'Магазин', x: 0.1, y: 0.1, width: 0.2, height: 0.2, layer: 'f1', height3d: 30 },
		{ id: 'cafe', type: 'ellipse', title: 'Кафе', x: 0.6, y: 0.5, rx: 0.1, ry: 0.1, layer: 'f1' },
		{ id: 'kiosk', type: 'point', title: 'Киоск', x: 0.9, y: 0.5, layer: 'f1' },
		{
			id: 'hall',
			type: 'svg',
			title: 'Зал',
			elementId: 'hall',
			layer: 'f2',
			parts: [{ elementId: 'hall' }, { elementId: 'hall-l', height3d: 10 }],
		},
	],
}

const created = vi.hoisted(() => [] as unknown[])

vi.mock('three', async importOriginal => {
	const actual = await importOriginal<typeof import('three')>()
	class TrackedMesh extends actual.Mesh {
		constructor(...args: ConstructorParameters<typeof actual.Mesh>) {
			super(...args)
			created.push(this)
		}
	}
	class TrackedLines extends actual.LineSegments {
		constructor(...args: ConstructorParameters<typeof actual.LineSegments>) {
			super(...args)
			created.push(this)
		}
	}
	return { ...actual, Mesh: TrackedMesh, LineSegments: TrackedLines }
})

const env = useMapEnvironment()

function createdResources(): Set<unknown> {
	const found = new Set<unknown>()
	created.forEach(object => {
		const mesh = object as Mesh
		found.add(mesh.geometry)
		const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as Array<ThreeMaterial & { map?: Texture }>
		materials.forEach(material => {
			found.add(material)
			if (material.map) found.add(material.map)
		})
	})
	return found
}

function trackDisposed(): Set<unknown> {
	const disposed = new Set<unknown>()
	for (const prototype of [BufferGeometry.prototype, Material.prototype, Texture.prototype]) {
		const original = prototype.dispose
		vi.spyOn(prototype, 'dispose').mockImplementation(function (this: unknown) {
			disposed.add(this)
			return original.call(this as never)
		})
	}
	return disposed
}

function trackGlobalListeners(): () => string[] {
	const live = new Map<string, number>()
	const original = { add: EventTarget.prototype.addEventListener, remove: EventTarget.prototype.removeEventListener }
	const key = (target: EventTarget, type: string) => `${target === window ? 'window' : 'document'}:${type}`
	const isGlobal = (target: EventTarget) => target === window || target === document
	vi.spyOn(EventTarget.prototype, 'addEventListener').mockImplementation(function (
		this: EventTarget,
		...args: Parameters<typeof original.add>
	) {
		if (isGlobal(this)) live.set(key(this, args[0]), (live.get(key(this, args[0])) ?? 0) + 1)
		return original.add.apply(this, args)
	})
	vi.spyOn(EventTarget.prototype, 'removeEventListener').mockImplementation(function (
		this: EventTarget,
		...args: Parameters<typeof original.remove>
	) {
		if (isGlobal(this)) live.set(key(this, args[0]), (live.get(key(this, args[0])) ?? 0) - 1)
		return original.remove.apply(this, args)
	})
	return () => [...live].filter(([, count]) => count > 0).map(([name]) => name)
}

beforeEach(() => {
	created.length = 0
	vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:svg'), revokeObjectURL: vi.fn() }))
	vi.spyOn(TextureLoader.prototype, 'loadAsync').mockImplementation(async () => new Texture())
})

describe('BaseImageMap3D: жизненный цикл', () => {
	it('повторные монтирование и размонтирование освобождают всё созданное, кадров после размонтирования нет', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const disposed = trackDisposed()
		const leftover = trackGlobalListeners()
		for (let cycle = 0; cycle < 4; cycle++) {
			created.length = 0
			const { renderer, scene, exposed, unmount } = await env.renderMap({ data: RICH })
			await waitFor(() => expect(scene().getObjectByName('hall')).toBeDefined())
			const resources = createdResources()
			expect(resources.size).toBeGreaterThan(10)
			exposed.value?.invalidate()
			const pending = vi.mocked(requestAnimationFrame).mock.results.at(-1)?.value
			unmount()
			expect(cancelAnimationFrame).toHaveBeenCalledWith(pending)
			expect([...resources].filter(resource => !disposed.has(resource))).toEqual([])
			expect(renderer.dispose).toHaveBeenCalledTimes(1)
			expect(renderer.forceContextLoss).toHaveBeenCalledTimes(1)
			expect(TestResizeObserver.instances.at(-1)?.disconnect).toHaveBeenCalledTimes(1)
			const rendered = renderer.render.mock.calls.length
			env.flushFrames()
			expect(renderer.render).toHaveBeenCalledTimes(rendered)
			expect(leftover()).toEqual([])
		}
		expect(warn).not.toHaveBeenCalled()
		expect(error).not.toHaveBeenCalled()
	})

	it('частая замена данных не копит объекты сцены и не пересоздаёт рендерер', async () => {
		const factory = vi.fn(() => createFakeRenderer())
		const view = render(BaseImageMap3D, { props: { data: RICH, rendererFactory: factory } })
		await waitFor(() => expect(factory).toHaveBeenCalled())
		const renderer = factory.mock.results[0].value as ReturnType<typeof createFakeRenderer>
		env.flushFrames()
		const scene = renderer.render.mock.calls.at(-1)?.[0] as Scene
		const other: ImageMap3DData = { layers: [RICH.layers[0]], objects: [RICH.objects[0]] }
		const count = () => {
			let total = 0
			scene.traverse(() => total++)
			return total
		}
		await waitFor(() => expect(scene.getObjectByName('hall')).toBeDefined())
		const rich = count()
		await view.rerender({ data: other })
		await waitFor(() => expect(scene.getObjectByName('hall')).toBeUndefined())
		const small = count()
		expect(small).toBeLessThan(rich)
		for (let index = 0; index < 6; index++) {
			await view.rerender({ data: index % 2 ? other : RICH })
			if (index % 2 === 0) await waitFor(() => expect(scene.getObjectByName('hall')).toBeDefined())
			else await waitFor(() => expect(scene.getObjectByName('hall')).toBeUndefined())
			expect(count()).toBe(index % 2 ? small : rich)
		}
		expect(factory).toHaveBeenCalledTimes(1)
		expect(renderer.dispose).not.toHaveBeenCalled()
		view.unmount()
	})

	it('замена данных при зависших загрузках: поздние ответы прежних данных сцену не меняют', async () => {
		const answers = new Map<string, (value: unknown) => void>()
		const signals = new Map<string, AbortSignal>()
		vi.stubGlobal(
			'fetch',
			vi.fn(
				(url: string, init: { signal: AbortSignal }) =>
					new Promise(resolve => {
						answers.set(url, resolve)
						signals.set(url, init.signal)
					}),
			),
		)
		const dataOf = (id: string): ImageMap3DData => ({
			layers: [{ id, title: id.toUpperCase(), svgUrl: `/${id}.svg`, width: 800, height: 400 }],
			objects: [{ id: `obj-${id}`, type: 'svg', title: id, elementId: `el-${id}` }],
		})
		const disposed = trackDisposed()
		const factory = vi.fn(() => createFakeRenderer())
		const view = render(BaseImageMap3D, { props: { data: dataOf('a'), rendererFactory: factory } })
		await waitFor(() => expect(factory).toHaveBeenCalled())
		await view.rerender({ data: dataOf('b') })
		await view.rerender({ data: dataOf('c') })
		await waitFor(() => expect(answers.has('/c.svg')).toBe(true))
		expect(signals.get('/a.svg')?.aborted).toBe(true)
		expect(signals.get('/b.svg')?.aborted).toBe(true)
		expect(signals.get('/c.svg')?.aborted).toBe(false)
		const renderer = factory.mock.results[0].value as ReturnType<typeof createFakeRenderer>
		const scene = () => renderer.render.mock.calls.at(-1)?.[0] as Scene
		const answer = (id: string) => answers.get(`/${id}.svg`)?.({ ok: true, text: async () => SVG(`el-${id}`) })
		answer('c')
		env.flushFrames()
		await waitFor(() => expect(scene().getObjectByName('obj-c')).toBeDefined())
		answer('a')
		answer('b')
		await new Promise(resolve => setTimeout(resolve, 0))
		env.flushFrames()
		expect(scene().getObjectByName('obj-a')).toBeUndefined()
		expect(scene().getObjectByName('obj-b')).toBeUndefined()
		expect(scene().getObjectByName('obj-c')).toBeDefined()
		expect(view.container.querySelector('.base-image-map-3d__state')).toBeNull()
		expect(view.container.querySelector('.base-image-map-3d__viewport')).toHaveAttribute('aria-busy', 'false')
		view.unmount()
		expect([...createdResources()].filter(resource => !disposed.has(resource))).toEqual([])
	})

	it('контейнер нулевого размера: размер не задаётся; когда он появляется — размер, камера и кадр', async () => {
		env.size.width = 0
		env.size.height = 0
		const { renderer, camera, unmount } = await env.renderMap({ data: RICH })
		expect(renderer.setSize).not.toHaveBeenCalled()
		expect((camera() as Camera).projectionMatrix.elements.every(Number.isFinite)).toBe(true)
		const drawn = renderer.render.mock.calls.length
		env.size.width = 800
		env.size.height = 400
		const observer = TestResizeObserver.instances.at(-1) as TestResizeObserver
		observer.callback([{ contentRect: { width: 800, height: 400 } } as ResizeObserverEntry], observer as unknown as ResizeObserver)
		env.flushFrames()
		expect(renderer.setSize).toHaveBeenLastCalledWith(800, 400, false)
		expect(renderer.render.mock.calls.length).toBeGreaterThan(drawn)
		expect((camera() as Camera).projectionMatrix.elements.every(Number.isFinite)).toBe(true)
		unmount()
	})

	it('контейнер скрыли (0×0) и показали снова: размер 0 не применяется, новый размер — применяется', async () => {
		const { renderer, camera, unmount } = await env.renderMap({ data: RICH })
		const observer = TestResizeObserver.instances.at(-1) as TestResizeObserver
		const resize = (width: number, height: number) =>
			observer.callback([{ contentRect: { width, height } } as ResizeObserverEntry], observer as unknown as ResizeObserver)
		const sizes = renderer.setSize.mock.calls.length
		resize(0, 0)
		env.flushFrames()
		expect(renderer.setSize).toHaveBeenCalledTimes(sizes)
		expect((camera() as Camera).projectionMatrix.elements.every(Number.isFinite)).toBe(true)
		resize(400, 300)
		env.flushFrames()
		expect(renderer.setSize).toHaveBeenLastCalledWith(400, 300, false)
		expect((camera() as Camera).projectionMatrix.elements.every(Number.isFinite)).toBe(true)
		unmount()
	})
})
