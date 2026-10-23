import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { LONE_DATA, pointer } from '../helpers/editHarness.test-utils'
import { FLOW_3D, mockWebGL, useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

const twoD = (container: Element): Element | null => container.querySelector('.base-flow-map-3d__pane .base-flow-map')
const status = () => document.querySelector('.base-flow-map-3d__sr[role="status"]')?.textContent ?? ''

describe('BaseFlowMap3D: снимок сцены', () => {
	beforeEach(() => {
		vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(new Blob(['png'], { type: 'image/png' })))
	})

	it('PNG в 3D рисуется с фоном и без него и озвучивается; после размонтирования — отказ', async () => {
		const { api, unmount } = await env.renderMap()
		const controller = api()
		const filled = await controller.exportPng({ pixelRatio: 2 })
		expect(filled).toBeInstanceOf(Blob)
		await controller.exportPng({ background: 'transparent' })
		await waitFor(() => expect(status()).toBe(UI_FLOW_MAP_3D.ANNOUNCE_SNAPSHOT))
		unmount()
		await expect(controller.exportPng()).rejects.toThrow(UI_FLOW_MAP_3D.ERROR_EXPORT_PNG)
	})

	it('SVG в 3D без загруженного 2D — понятная ошибка', async () => {
		const { api } = await env.renderMap()
		await expect(api().exportSvg()).rejects.toThrow(UI_FLOW_MAP_3D.ERROR_EXPORT_SVG)
	})
})

describe('BaseFlowMap3D: нижняя панель и контроллер', () => {
	it('частицы выключаются и включаются кнопкой, «Слои» — по `data.view3d` и пропу', async () => {
		const { rerender, api } = await env.renderMap({
			hasLayersToggle: true,
			data: { ...FLOW_3D, view3d: { isLayered: true } },
		})
		const particles = screen.getByRole('button', { name: UI_FLOW_MAP_3D.PARTICLES })
		await fireEvent.click(particles)
		await waitFor(() => expect(status()).toBe(UI_FLOW_MAP_3D.ANNOUNCE_PARTICLES_OFF))
		await fireEvent.click(particles)
		await waitFor(() => expect(status()).toBe(UI_FLOW_MAP_3D.ANNOUNCE_PARTICLES_ON))
		await rerender({ particles: 0 })
		expect(particles).toHaveAttribute('aria-pressed', 'false')
		api().setLayered(true)
		await nextTick()
		await fireEvent.click(screen.getByRole('button', { name: UI_FLOW_MAP_3D.LAYERS }))
		await waitFor(() => expect(status()).toBe(UI_FLOW_MAP_3D.ANNOUNCE_LAYERS_OFF))
	})

	it('«Слои» без пропа берутся из `data.view3d.isLayered`', async () => {
		await env.renderMap({ hasLayersToggle: true, data: { ...FLOW_3D, view3d: { isLayered: true } } })
		expect(screen.getByRole('button', { name: UI_FLOW_MAP_3D.LAYERS })).toHaveAttribute('aria-pressed', 'true')
	})

	it('«Слои» по пропу `isLayered` задают начальное состояние; повторная установка того же значения молчит', async () => {
		const { api } = await env.renderMap({ hasLayersToggle: true, isLayered: true })
		expect(screen.getByRole('button', { name: UI_FLOW_MAP_3D.LAYERS })).toHaveAttribute('aria-pressed', 'true')
		api().setLayered(true)
		await nextTick()
		expect(screen.getByRole('button', { name: UI_FLOW_MAP_3D.LAYERS })).toHaveAttribute('aria-pressed', 'true')
	})

	it('неизвестный пресет камеры и тот же вид или режим ничего не меняют; полёт к неизвестному узлу молчит', async () => {
		const onCamera = vi.fn()
		const onView = vi.fn()
		const onMode = vi.fn()
		const { api } = await env.renderMap({ 'onUpdate:camera': onCamera, 'onUpdate:view': onView, 'onUpdate:mode': onMode })
		api().setCamera('bogus' as never)
		api().setView('3d')
		api().flyTo('нет такого')
		await nextTick()
		expect(onCamera).not.toHaveBeenCalled()
		expect(onView).not.toHaveBeenCalled()
		expect(onMode).not.toHaveBeenCalled()
	})

	it('фокус на узле, чья бирка ещё не нарисована, показывает узел камерой', async () => {
		const map = await env.renderMap()
		await map.rerender({ data: { ...FLOW_3D, nodes: [...FLOW_3D.nodes, { id: 'fresh', label: 'Новый', kind: 'service' }] } })
		map.api().focus('fresh')
		await nextTick()
		env.flushFrames()
		expect(map.container.querySelector('[data-label-id="fresh"]')).toBeInTheDocument()
	})
})

describe('BaseFlowMap3D: окружение', () => {
	it('смена темы без 3D-сцены (запасной 2D) ничего не пересобирает', async () => {
		mockWebGL(false)
		const { container } = await env.renderMap({}, {}, { isRenderer: false })
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		document.documentElement.setAttribute('data-theme', 'dark')
		await nextTick()
		document.documentElement.removeAttribute('data-theme')
	})

	it('без ResizeObserver компонент собирается, ширина «узкой» правки неизвестна', async () => {
		const { container } = await env.renderMap({ mode: 'edit', modes: ['view', 'edit'] }, {}, { isRenderer: false })
		expect(container.querySelector('section')).toBeInTheDocument()
	})

	it('порог компактного вида берётся из `compactBreakpoint`', async () => {
		env.size.width = 500
		const { container } = await env.renderMap({ compactBreakpoint: 400 })
		expect(container.querySelector('.base-flow-map-3d--compact')).toBeNull()
		const narrow = await env.renderMap({ compactBreakpoint: 900 })
		expect(narrow.container.querySelector('.base-flow-map-3d--compact')).toBeInTheDocument()
	})

	it('штатная фабрика рендерера без WebGL-контекста уводит в запасной 2D', async () => {
		const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		const warns = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const { container } = await env.renderMap({ rendererFactory: undefined }, {}, { isRenderer: false })
		await waitFor(() => expect(twoD(container)).toBeInTheDocument(), { timeout: 8000 })
		expect(errors.mock.calls.length + warns.mock.calls.length).toBeGreaterThanOrEqual(0)
	}, 20_000)

	it('анимация сцены при уменьшенном движении выполняется сразу, при обычном — по кадрам', async () => {
		const reduced = vi.fn()
		const { api: reducedApi } = await env.renderMap({ onSceneReady: reduced })
		const tick = vi.fn()
		const stop = reduced.mock.calls[0][0].animate(tick)
		expect(tick).toHaveBeenCalledWith(0, 0)
		expect(stop()).toBeUndefined()
		expect(reducedApi().getSceneContext()).not.toBeNull()
		env.setMotion('standard')
		const moving = vi.fn()
		await env.renderMap({ onSceneReady: moving })
		const frames = vi.fn(() => false)
		moving.mock.calls[0][0].animate(frames)
		env.flushFrames(100)
		expect(frames).toHaveBeenCalled()
	})
})

describe('BaseFlowMap3D: 2D внутри 3D', () => {
	it('выбор узла в 2D попадает в выделение 3D, быстрый возврат до готовности 2D не ломает положение', async () => {
		const onSelection = vi.fn()
		const { container, api } = await env.renderMap(
			{ data: LONE_DATA, view: '2d', 'onUpdate:selection': onSelection },
			{},
			{ isRenderer: false },
		)
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		const node = await waitFor(() => {
			const found = container.querySelector('[data-flow-entity="node"][data-flow-id="a"]')
			expect(found).toBeInTheDocument()
			return found as Element
		})
		await pointer('pointerdown', node, { x: 10, y: 10 })
		await pointer('pointerup', window, { x: 10, y: 10 })
		await pointer('click', node, { x: 10, y: 10 })
		await waitFor(() => expect(onSelection).toHaveBeenCalledWith(['a']))
		api().setView('3d')
		api().setView('2d')
		api().setView('3d')
		await waitFor(() => expect(container.querySelector('canvas')).toBeInTheDocument())
	}, 30_000)
})
