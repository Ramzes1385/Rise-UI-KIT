import '@testing-library/jest-dom/vitest'
import BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { ImageMap3DData } from '../types/imageMap3dData.types'
import { createFakeRenderer, mockWebGL } from './imageMap3d.test-utils'
import type { BaseImageMap3DExpose } from '../types/BaseImageMap3D.types'
import type { Mesh, MeshStandardMaterial, Scene, TubeGeometry } from 'three'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', width: 800, height: 400, elevation: 300 },
	],
	objects: [
		{ id: 'start', type: 'rect', title: 'Вход', x: 0.05, y: 0.45, width: 0.1, height: 0.1, layer: 'f1' },
		{ id: 'goal', type: 'rect', title: 'Кафе', x: 0.85, y: 0.45, width: 0.1, height: 0.1, layer: 'f2' },
	],
	routes: {
		nodes: [
			{ id: 'a', layer: 'f1', x: 0.1, y: 0.5, object: 'start' },
			{ id: 'b', layer: 'f1', x: 0.5, y: 0.5 },
			{ id: 'c', layer: 'f2', x: 0.6, y: 0.5 },
			{ id: 'd', layer: 'f2', x: 0.9, y: 0.5, object: 'goal' },
		],
		edges: [
			['a', 'b'],
			['c', 'd'],
		],
		transitions: [{ id: 'lift', type: 'elevator', title: 'Лифт', nodes: ['b', 'c'] }],
	},
}

class TestResizeObserver {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}

let frames: FrameRequestCallback[] = []
let now = 0

function flushFrames(advance = 0): void {
	now += advance
	const queue = frames
	frames = []
	queue.forEach(callback => callback(now))
}

beforeEach(() => {
	frames = []
	now = 0
	vi.stubGlobal('ResizeObserver', TestResizeObserver)
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
	)
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
	vi.spyOn(performance, 'now').mockImplementation(() => now)
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
	mockWebGL(true)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	document.documentElement.removeAttribute('data-rise-motion')
	document.documentElement.removeAttribute('data-rise-theme')
})

function mockThemeColors(): void {
	const original = window.getComputedStyle.bind(window)
	const themed = () => (document.documentElement.getAttribute('data-rise-theme') === 'dark' ? 'rgb(10, 20, 30)' : 'rgb(200, 100, 50)')
	vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
		const style = original(element, pseudo)
		if (!(element instanceof HTMLSpanElement && element.hidden)) return style
		return new Proxy(style, {
			get: (target, key) => {
				if (key === 'color') return themed()
				const value = Reflect.get(target, key)
				return typeof value === 'function' ? value.bind(target) : value
			},
		})
	})
}

async function renderRoutes(props: Record<string, unknown> = {}) {
	const renderer = createFakeRenderer()
	const exposed = ref<BaseImageMap3DExpose | null>(null)
	const Host = defineComponent({
		setup:
			(_, { attrs }) =>
			() =>
				h(BaseImageMap3D, { data: DATA, rendererFactory: () => renderer, hasRoutes: true, ...attrs, ref: exposed }),
	})
	const result = render(Host, { attrs: props })
	await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
	await nextTick()
	flushFrames()
	const scene = (): Scene => renderer.render.mock.calls.at(-1)?.[0] as Scene
	const tube = () => scene().getObjectByName('rise-route')?.children[0] as Mesh<TubeGeometry> | undefined
	return { ...result, renderer, exposed, scene, tube }
}

describe('BaseImageMap3D: маршруты', () => {
	it('маршрут между этажами — трубка в сцене целиком при reduce, панель шагов, route-change и этаж начала', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const onRouteChange = vi.fn()
		const { tube } = await renderRoutes({ route: { from: 'start', to: 'goal' }, onRouteChange })
		expect(onRouteChange).toHaveBeenCalledWith(expect.objectContaining({ from: expect.objectContaining({ id: 'start' }) }))
		const geometry = tube()?.geometry as TubeGeometry
		expect(geometry.drawRange.count).toBe(geometry.index?.count)
		expect(screen.getByText(/Лифт/)).toBeInTheDocument()
	})

	it('линия растёт по кадрам и доходит до конца', async () => {
		const { tube, exposed } = await renderRoutes()
		expect(tube()).toBeUndefined()
		exposed.value?.showRoute('start', 'goal')
		await nextTick()
		await nextTick()
		flushFrames()
		const geometry = tube()?.geometry as TubeGeometry
		const total = geometry.index?.count as number
		expect(geometry.drawRange.count).toBeLessThan(total)
		for (let step = 0; step < 20; step += 1) flushFrames(100)
		await nextTick()
		expect(geometry.drawRange.count).toBe(total)
	})

	it('шаг маршрута показывает свой этаж; clearRoute убирает трубку; тема перекрашивает', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		mockThemeColors()
		const onLayerChange = vi.fn()
		const { tube, exposed, scene } = await renderRoutes({ route: { from: 'start', to: 'goal' }, onLayerChange })
		const steps = screen.getAllByRole('button').filter(button => /Кафе|2/.test(button.textContent ?? ''))
		await fireEvent.click(steps.at(-1) as HTMLElement)
		await waitFor(() => expect(onLayerChange).toHaveBeenCalledWith('f2'))
		const material = (tube() as Mesh<TubeGeometry, MeshStandardMaterial>).material
		expect(material.color.getHexString()).toBe('c86432')
		document.documentElement.setAttribute('data-rise-theme', 'dark')
		await waitFor(() => expect(material.color.getHexString()).toBe('0a141e'))
		exposed.value?.clearRoute()
		await nextTick()
		await nextTick()
		flushFrames()
		expect(scene().getObjectByName('rise-route')).toBeUndefined()
	})

	it('пресет движения берётся у предка карты: data-rise-motion="none" на обёртке — линия сразу целиком', async () => {
		const wrapper = document.body.appendChild(document.createElement('section'))
		wrapper.setAttribute('data-rise-motion', 'none')
		const renderer = createFakeRenderer()
		render(BaseImageMap3D, {
			props: { data: DATA, rendererFactory: () => renderer, hasRoutes: true, route: { from: 'start', to: 'goal' } },
			container: wrapper.appendChild(document.createElement('div')),
		})
		await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
		await nextTick()
		await nextTick()
		flushFrames()
		expect(document.documentElement).not.toHaveAttribute('data-rise-motion')
		const scene = renderer.render.mock.calls.at(-1)?.[0] as Scene
		const geometry = (scene.getObjectByName('rise-route')?.children[0] as Mesh<TubeGeometry>).geometry
		expect(geometry.drawRange.count).toBe(geometry.index?.count)
		wrapper.remove()
	})

	it('уход в 2D освобождает трубку; панель маршрута — и в 2D', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { tube, exposed, container } = await renderRoutes({ route: { from: 'start', to: 'goal' } })
		const dispose = vi.spyOn((tube() as Mesh<TubeGeometry>).geometry, 'dispose')
		exposed.value?.setView('2d')
		await nextTick()
		await nextTick()
		expect(dispose).toHaveBeenCalled()
		expect(within(container as HTMLElement).getAllByText(/Лифт/).length).toBeGreaterThan(0)
	})
})
