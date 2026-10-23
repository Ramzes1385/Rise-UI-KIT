import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { mockWebGL, useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

const env = useFlowMap3DEnvironment()

const twoD = (container: Element): Element | null => container.querySelector('.base-flow-map-3d__pane .base-flow-map')

describe('BaseFlowMap3D: запасной 2D-вид', () => {
	it('без WebGL показывает 2D с пояснением, сообщает причину и не создаёт рендерер', async () => {
		mockWebGL(false)
		const rendererFactory = vi.fn()
		const onFallback = vi.fn()
		const { container } = await env.renderMap({ rendererFactory, onFallback, view: '3d' }, {}, { isRenderer: false })
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		expect(onFallback).toHaveBeenCalledWith('unsupported')
		expect(rendererFactory).not.toHaveBeenCalled()
		expect(screen.getByText('Браузер не поддерживает 3D — показана карта в 2D')).toBeInTheDocument()
		expect(container.querySelector('canvas')).toBeNull()
		expect(screen.queryByRole('radiogroup', { name: 'Вид карты' })).toBeNull()
	})

	it('если рендерер не создался, показывает 2D с причиной «error»', async () => {
		const onFallback = vi.fn()
		const { container } = await env.renderMap(
			{
				rendererFactory: () => {
					throw new Error('нет контекста')
				},
				onFallback,
			},
			{},
			{ isRenderer: false },
		)
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		expect(onFallback).toHaveBeenCalledWith('error')
	})

	it('потеря контекста без восстановления за 3 секунды переводит в 2D, восстановление — нет', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const onFallback = vi.fn()
		const { container, renderer } = await env.renderMap({ onFallback })
		const lost = new Event('webglcontextlost', { cancelable: true })
		renderer.domElement.dispatchEvent(lost)
		expect(lost.defaultPrevented).toBe(true)
		renderer.domElement.dispatchEvent(new Event('webglcontextrestored'))
		vi.advanceTimersByTime(3500)
		expect(onFallback).not.toHaveBeenCalled()
		renderer.domElement.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
		vi.advanceTimersByTime(3100)
		vi.useRealTimers()
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		expect(onFallback).toHaveBeenCalledWith('error')
	})

	it('view="2d" открывает 2D сразу, без сбоя и без холста', async () => {
		const onFallback = vi.fn()
		const { container } = await env.renderMap({ view: '2d', onFallback })
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		expect(onFallback).not.toHaveBeenCalled()
		expect(container.querySelector('canvas')).toBeNull()
	})
})

describe('BaseFlowMap3D: 3D ↔ 2D', () => {
	it('переключатель в нижней панели меняет вид и сообщает `update:view`', async () => {
		const onView = vi.fn()
		const { container } = await env.renderMap({ 'onUpdate:view': onView })
		await fireEvent.click(screen.getByRole('radio', { name: '2D' }))
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		expect(onView).toHaveBeenCalledWith('2d')
		expect(container.querySelector('canvas')).toBeNull()
		await fireEvent.click(screen.getByRole('radio', { name: '3D' }))
		await waitFor(() => expect(container.querySelector('canvas')).toBeInTheDocument())
		expect(onView).toHaveBeenLastCalledWith('3d')
	})

	it('при переходе в 2D положение переносится в область 2D и возвращается обратно', async () => {
		const { api, container } = await env.renderMap()
		const before = api().getViewport()
		api().setView('2d')
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		await nextTick()
		const inTwoD = api().getViewport()
		expect(inTwoD.zoom).toBeCloseTo(before.zoom, 4)
		expect(inTwoD.x).toBeCloseTo(before.x, 1)
		expect(inTwoD.y).toBeCloseTo(before.y, 1)
		api().setView('3d')
		await waitFor(() => expect(container.querySelector('canvas')).toBeInTheDocument())
		await nextTick()
		await nextTick()
		await nextTick()
		const back = api().getViewport()
		expect(back.zoom).toBeCloseTo(before.zoom, 3)
		expect(back.x).toBeCloseTo(before.x, 0)
	})

	it('смена пропса `view` подхватывается', async () => {
		const { container, rerender } = await env.renderMap()
		await rerender({ view: '2d' })
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
	})
})

describe('BaseFlowMap3D: правка на узком контейнере', () => {
	it('режим «Правка» уже 768 px открывает 2D, а кнопка возвращает к 3D', async () => {
		env.size.width = 700
		const onMode = vi.fn()
		const { container } = await env.renderMap(
			{ mode: 'edit', modes: ['view', 'edit'], 'onUpdate:mode': onMode },
			{},
			{ isRenderer: false },
		)
		await waitFor(() => expect(twoD(container)).toBeInTheDocument())
		await fireEvent.click(screen.getByRole('button', { name: '3D' }))
		expect(onMode).toHaveBeenCalledWith('view')
	})
})
