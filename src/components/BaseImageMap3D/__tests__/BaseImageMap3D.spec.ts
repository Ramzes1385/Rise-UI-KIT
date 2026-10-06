import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import { BaseImageMap } from '@components/BaseImageMap'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three'
import { render, screen, waitFor } from '@testing-library/vue'
import type { BaseImageMap3DExpose } from '../types/BaseImageMap3D.types'
import { createFakeRenderer, DATA_3D, mockWebGL } from './imageMap3d.test-utils'

let resizeCallback: ResizeObserverCallback | null = null
const observe = vi.fn()
const disconnect = vi.fn()

class TestResizeObserver {
	constructor(callback: ResizeObserverCallback) {
		resizeCallback = callback
	}
	observe = observe
	unobserve = vi.fn()
	disconnect = disconnect
}

function triggerResize(width: number, height: number): void {
	resizeCallback?.([{ contentRect: { width, height } } as ResizeObserverEntry], {} as ResizeObserver)
}

function runPendingFrames(): void {
	vi.mocked(requestAnimationFrame)
		.mock.calls.slice()
		.forEach(([callback]) => callback(0))
}

beforeEach(() => {
	resizeCallback = null
	vi.stubGlobal('ResizeObserver', TestResizeObserver)
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn(() => 7),
	)
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
	vi.unstubAllGlobals()
})

function renderMap(props: Record<string, unknown> = {}) {
	const renderer = createFakeRenderer()
	const rendererFactory = vi.fn(() => renderer)
	const exposed = ref<BaseImageMap3DExpose | null>(null)
	const Host = defineComponent({
		setup:
			(_, { attrs }) =>
			() =>
				h(BaseImageMap3D, { data: DATA_3D, rendererFactory, ...attrs, ref: exposed }),
	})
	const result = render(Host, { attrs: props })
	return { ...result, renderer, rendererFactory, exposed }
}

describe('BaseImageMap3D: 3D-вид', () => {
	beforeEach(() => {
		mockWebGL(true)
	})

	it('создаёт рендерер на своём холсте, ставит плотность пикселей и область с именем', async () => {
		const { renderer, rendererFactory, container } = renderMap()
		await waitFor(() => expect(rendererFactory).toHaveBeenCalledOnce())
		const canvas = container.querySelector('canvas') as HTMLCanvasElement
		expect(rendererFactory).toHaveBeenCalledWith(canvas)
		expect(canvas).toHaveAttribute('aria-hidden', 'true')
		expect(renderer.setPixelRatio).toHaveBeenCalledWith(1)
		const region = screen.getByRole('group', { name: 'Этаж 1' })
		expect(region).toHaveAttribute('aria-roledescription', '3D-карта')
		expect(region).toHaveAttribute('tabindex', '0')
		expect(region).toHaveStyle({ aspectRatio: '800 / 400' })
		expect(document.querySelector('.base-image-map-3d__status')).toHaveTextContent('')
	})

	it('плотность пикселей не больше 2', async () => {
		vi.stubGlobal('devicePixelRatio', 3)
		const { renderer } = renderMap()
		await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalledWith(2))
	})

	it('ResizeObserver меняет размер и перерисовывает по требованию: один кадр на несколько запросов', async () => {
		const { renderer, rendererFactory, exposed } = renderMap({ height: '300px', ariaLabel: 'Торговый центр' })
		await waitFor(() => expect(rendererFactory).toHaveBeenCalledOnce())
		const region = screen.getByRole('group', { name: 'Торговый центр' })
		expect(region).toHaveStyle({ height: '300px' })
		expect(observe).toHaveBeenCalledWith(region)
		const raf = vi.mocked(requestAnimationFrame)
		const pending = raf.mock.calls.length
		triggerResize(0, 100)
		expect(renderer.setSize).not.toHaveBeenCalled()
		triggerResize(640, 320)
		expect(renderer.setSize).toHaveBeenCalledWith(640, 320, false)
		exposed.value?.invalidate()
		expect(raf).toHaveBeenCalledTimes(pending)
		runPendingFrames()
		expect(renderer.render).toHaveBeenCalledOnce()
		const scheduled = raf.mock.calls.length
		exposed.value?.invalidate()
		expect(raf).toHaveBeenCalledTimes(scheduled + 1)
	})

	it('смена данных переставляет камеру', async () => {
		const { renderer, rerender } = renderMap()
		await waitFor(() => expect(observe).toHaveBeenCalled())
		vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(500)
		vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(250)
		await rerender({ data: { ...DATA_3D, layers: [{ id: 'x', title: 'X', width: 2000, height: 1000 }] } })
		await waitFor(() => expect(renderer.setSize).toHaveBeenCalledWith(500, 250, false))
	})

	it('при размонтировании освобождает сцену, рендерер и контекст, снимает наблюдатель и кадр', async () => {
		const { renderer, exposed, unmount } = renderMap()
		await waitFor(() => expect(observe).toHaveBeenCalled())
		triggerResize(100, 100)
		exposed.value?.invalidate()
		unmount()
		expect(cancelAnimationFrame).toHaveBeenCalledWith(7)
		expect(disconnect).toHaveBeenCalled()
		expect(renderer.dispose).toHaveBeenCalledOnce()
		expect(renderer.forceContextLoss).toHaveBeenCalledOnce()
	})

	it('без фабрики берёт WebGLRenderer three.js; ошибка создания — 2D, статус и событие error', async () => {
		const onFallback = vi.fn()
		render(BaseImageMap3D, { props: { data: DATA_3D, onFallback } })
		await waitFor(() =>
			expect(document.querySelector('.base-image-map-3d__status')).toHaveTextContent('Не удалось запустить 3D — показан план'),
		)
		expect(onFallback).toHaveBeenCalledWith('error')
		expect(document.querySelector('canvas')).toBeNull()
		expect(document.querySelector('.base-image-map')).toBeInTheDocument()
	})

	it('v-model:view: setView и проп view переключают 2D и 3D, холст создаётся заново', async () => {
		const onUpdateView = vi.fn()
		const { exposed, rendererFactory, renderer, rerender, container } = renderMap({ 'onUpdate:view': onUpdateView })
		await waitFor(() => expect(rendererFactory).toHaveBeenCalledOnce())
		exposed.value?.setView('2d')
		await nextTick()
		expect(onUpdateView).toHaveBeenCalledWith('2d')
		await waitFor(() => expect(container.querySelector('.base-image-map')).toBeInTheDocument())
		expect(renderer.dispose).toHaveBeenCalledOnce()
		await rerender({ view: '3d' })
		await rerender({ view: '2d' })
		await rerender({ view: '3d' })
		await waitFor(() => expect(rendererFactory).toHaveBeenCalledTimes(2))
	})

	it('setLayer: известный этаж — события; тот же или неизвестный — ничего', async () => {
		const onLayerChange = vi.fn()
		const { exposed } = renderMap({ onLayerChange, layer: 'f1' })
		await waitFor(() => expect(exposed.value).not.toBeNull())
		exposed.value?.setLayer('f1')
		exposed.value?.setLayer('nope')
		expect(onLayerChange).not.toHaveBeenCalled()
		exposed.value?.setLayer('f2')
		expect(onLayerChange).toHaveBeenCalledWith('f2')
	})

	it('освобождает объекты сцены при уходе из 3D', async () => {
		const geometry = new BoxGeometry()
		const material = new MeshBasicMaterial()
		const spies = [vi.spyOn(geometry, 'dispose'), vi.spyOn(material, 'dispose')]
		const { exposed, rendererFactory, renderer } = renderMap()
		await waitFor(() => expect(rendererFactory).toHaveBeenCalled())
		const sceneArg = { value: null as unknown }
		renderer.render.mockImplementation((value: unknown) => {
			sceneArg.value = value
		})
		triggerResize(10, 10)
		runPendingFrames()
		;(sceneArg.value as { add: (mesh: Mesh) => void }).add(new Mesh(geometry, material))
		exposed.value?.setView('2d')
		await waitFor(() => expect(spies.every(spy => spy.mock.calls.length === 1)).toBe(true))
	})
})

describe('BaseImageMap3D: 2D-вид', () => {
	it('без WebGL (jsdom) — BaseImageMap, статус и событие unsupported', async () => {
		mockWebGL(false)
		const onFallback = vi.fn()
		const { rendererFactory } = renderMap({ onFallback })
		await waitFor(() =>
			expect(document.querySelector('.base-image-map-3d__status')).toHaveTextContent('Браузер не поддерживает 3D — показан план'),
		)
		expect(rendererFactory).not.toHaveBeenCalled()
		expect(screen.getByRole('button', { name: 'Магазин' })).toBeInTheDocument()
		expect(onFallback).toHaveBeenCalledWith('unsupported')
	})

	it('передаёт BaseImageMap данные, пропсы и оформление, но не свои пропсы', async () => {
		mockWebGL(true)
		const { container } = renderMap({ view: '2d', variant: 'outline', hasTooltip: false, customClass: { root: 'my-root' } })
		const map = container.querySelector('.base-image-map') as HTMLElement
		expect(map).toHaveClass('base-image-map--outline')
		expect(container.querySelector('.base-image-map-3d')).toHaveClass('my-root')
		expect(map).not.toHaveClass('my-root')
		expect(container.querySelector('.base-image-map-3d__viewport')).toBeNull()
	})

	it('пересылает события BaseImageMap', async () => {
		mockWebGL(true)
		const onSelect = vi.fn()
		const onUpdateActive = vi.fn()
		const { container } = renderMap({ view: '2d', onSelect, 'onUpdate:active': onUpdateActive })
		const map = container.querySelector('.base-image-map') as HTMLElement
		expect(map).toBeInTheDocument()
		screen.getByRole('button', { name: 'Кафе' }).click()
		await waitFor(() => expect(onUpdateActive).toHaveBeenCalledWith('cafe'))
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'cafe' }))
	})

	it('передаёт слоты BaseImageMap', async () => {
		mockWebGL(true)
		render(BaseImageMap3D, {
			props: { data: DATA_3D, view: '2d', hasDirectory: true, search: 'нет такого' },
			slots: {
				point: '<b>●</b>',
				tooltip: 'подсказка',
				popup: 'окно',
				'directory-item': 'строка',
				'directory-empty': '<i>Пусто</i>',
			},
		})
		expect(screen.getAllByText('●')).toHaveLength(2)
		expect(screen.getByText('Пусто')).toBeInTheDocument()
	})

	it('подсказка, окно и строка списка — из слотов', async () => {
		mockWebGL(true)
		render(BaseImageMap3D, {
			props: { data: DATA_3D, view: '2d', hasDirectory: true },
			slots: {
				tooltip: '<span>подсказка из слота</span>',
				popup: '<span>окно из слота</span>',
				'directory-item': '<span>строка из слота</span>',
			},
		})
		expect(screen.getAllByText('строка из слота').length).toBeGreaterThan(0)
		const shop = screen.getAllByRole('button', { name: 'Магазин' })[0]
		shop.focus()
		await waitFor(() => expect(screen.getByText('подсказка из слота')).toBeInTheDocument())
		shop.click()
		await waitFor(() => expect(screen.getByText('окно из слота')).toBeInTheDocument())
	})

	it('BaseImageMap получает те же умолчания, что и сам по себе', () => {
		mockWebGL(true)
		const { container } = render(BaseImageMap3D, { props: { data: DATA_3D, view: '2d' } })
		const own = render(BaseImageMap, { props: { data: DATA_3D } })
		const markup = (root: Element | null | undefined) => root?.innerHTML.replace(/rise-segmented-v-\d+/g, 'rise-segmented')
		expect(markup(container.querySelector('.base-image-map'))).toBe(markup(own.container.querySelector('.base-image-map')))
	})

	it('умолчания переопределяются настройками плагина', () => {
		mockWebGL(true)
		render(BaseImageMap3D, {
			props: { data: DATA_3D },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseImageMap3D: { view: '2d' } } })] },
		})
		expect(document.querySelector('.base-image-map')).toBeInTheDocument()
	})

	it('предупреждает о неверных 3D-полях данных', () => {
		mockWebGL(false)
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		render(BaseImageMap3D, { props: { data: { ...DATA_3D, scene3d: { floorGap: -1 } } } })
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('scene3d.floorGap = -1'))
	})
})
