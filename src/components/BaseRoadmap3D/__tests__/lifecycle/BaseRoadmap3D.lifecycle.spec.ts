import '@testing-library/jest-dom/vitest'
import { waitFor } from '@testing-library/vue'
import { BufferGeometry, Material } from 'three'
import { DATA_ROADMAP_3D, createFakeRenderer, useRoadmap3DEnvironment } from '../fixtures/roadmap3d.test-utils'

const env = useRoadmap3DEnvironment()

describe('BaseRoadmap3D: жизненный цикл', () => {
	it('при размонтировании рендерер освобождается, контекст теряется, сцена очищена', async () => {
		const disposeGeometry = vi.spyOn(BufferGeometry.prototype, 'dispose')
		const disposeMaterial = vi.spyOn(Material.prototype, 'dispose')
		const { renderer, unmount } = await env.renderRoadmap()
		unmount()
		expect(renderer.dispose).toHaveBeenCalled()
		expect(renderer.forceContextLoss).toHaveBeenCalled()
		expect(disposeGeometry).toHaveBeenCalled()
		expect(disposeMaterial).toHaveBeenCalled()
	})

	it('замена данных с другим числом этапов освобождает прежние геометрии и собирает новые модели', async () => {
		const dispose = vi.spyOn(BufferGeometry.prototype, 'dispose')
		const { exposed, rerender } = await env.renderRoadmap()
		const before = dispose.mock.calls.length
		await rerender({ data: { ...DATA_ROADMAP_3D, stages: DATA_ROADMAP_3D.stages.slice(0, 2) } })
		await waitFor(() => expect(exposed.value?.getModels()).toHaveLength(2))
		expect(dispose.mock.calls.length).toBeGreaterThan(before)
	})

	it('замена данных после ошибки рендерера даёт 3D ещё раз', async () => {
		let attempts = 0
		const renderer = createFakeRenderer()
		const rendererFactory = vi.fn(() => {
			attempts += 1
			if (attempts === 1) throw new Error('нет контекста')
			return renderer
		})
		const { events, rerender } = await env.renderRoadmap({ rendererFactory })
		await waitFor(() => expect(events.fallback?.[0]).toEqual(['error']))
		await rerender({ data: { ...DATA_ROADMAP_3D, title: 'Другой' } })
		await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
	})

	it('потеря контекста WebGL без восстановления — запасной 2D-вид', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const { renderer, events } = await env.renderRoadmap()
		renderer.domElement.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
		await vi.advanceTimersByTimeAsync(3100)
		expect(events.fallback?.at(-1)).toEqual(['error'])
		vi.useRealTimers()
	})

	it('нулевой размер контейнера не ломает сборку и не масштабирует рендерер', async () => {
		env.size.width = 0
		env.size.height = 0
		const { renderer, exposed } = await env.renderRoadmap()
		expect(renderer.setSize).not.toHaveBeenCalled()
		expect(exposed.value?.getModels()).toHaveLength(4)
	})

	it('ResizeObserver отключается при размонтировании', async () => {
		const { unmount } = await env.renderRoadmap()
		unmount()
		const { TestResizeObserver } = await import('../../../BaseImageMap3D/__tests__/imageMap3d.test-utils')
		TestResizeObserver.instances.forEach(observer => expect(observer.disconnect).toHaveBeenCalled())
	})

	it('пауза по document.hidden не роняет цикл кадров', async () => {
		const { renderer } = await env.renderRoadmap({ isTourPlaying: false })
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
		document.dispatchEvent(new Event('visibilitychange'))
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => false })
		document.dispatchEvent(new Event('visibilitychange'))
		env.flush(2)
		expect(renderer.render).toHaveBeenCalled()
	})
})
