import { shallowRef } from 'vue'
import { mountWith } from '../../fixtures/model.test-utils'
import { useCarMotion } from '../../../model/motion/useCarMotion'
import type { Scene3DTick } from '@/scene3d/types/internal/scene3dInternal.types'
import type { RoadmapData } from '@components/BaseRoadmap/types/roadmapData.types'
import type { Roadmap3DContent } from '../../../types/internal/roadmap3dInternal.types'
import { DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, stagesData } from '../../fixtures/roadmap3d.test-utils'

function fakeContent() {
	const setProgress = vi.fn()
	const setCar = vi.fn()
	return { content: { road: { setProgress }, markers: { setCar } } as unknown as Roadmap3DContent, setProgress, setCar }
}

function mountCar(options: { isReduced?: boolean; duration?: number; data?: RoadmapData } = {}) {
	const content = shallowRef<Roadmap3DContent | null>(null)
	const ticks: Scene3DTick[] = []
	const stops: Array<ReturnType<typeof vi.fn>> = []
	const animate = vi.fn((tick: Scene3DTick) => {
		ticks.push(tick)
		const stop = vi.fn()
		stops.push(stop)
		return stop
	})
	const invalidate = vi.fn()
	const settings = { isReduced: options.isReduced ?? false, duration: options.duration ?? 100 }
	const mounted = mountWith(options.data ?? DATA_ROADMAP_3D, PROGRESS_ROADMAP_3D, ({ snapshot }) =>
		useCarMotion({
			content,
			snapshot,
			animate,
			invalidate,
			isReducedMotion: () => settings.isReduced,
			getDuration: () => settings.duration,
		}),
	)
	return { ...mounted, car: mounted.made, content, ticks, stops, animate, invalidate, settings }
}

const PROGRESS_DONE = { version: 1, topics: { html: { status: 'done' }, css: { status: 'done' }, vue: { status: 'done' } } }

describe('useCarMotion', () => {
	it('при первой сборке машинка выезжает с нуля до прогресса за вступление', () => {
		const { car, content, ticks, snapshot } = mountCar()
		const built = fakeContent()
		content.value = built.content
		return Promise.resolve().then(() => {
			expect(built.setProgress).toHaveBeenCalledWith(0)
			expect(ticks).toHaveLength(1)
			expect(ticks[0](1.3, 0)).toBe(true)
			expect(car.getShown()).toBeGreaterThan(0)
			expect(ticks[0](5, 0)).toBe(false)
			expect(car.getShown()).toBeCloseTo(snapshot.value.progress)
			expect(built.setCar).toHaveBeenLastCalledWith(car.getShown())
		})
	})

	it('вторая сборка ставит машинку сразу на прогресс, без вступления', async () => {
		const { content, animate, car, snapshot } = mountCar()
		content.value = fakeContent().content
		await Promise.resolve()
		animate.mockClear()
		const second = fakeContent()
		content.value = second.content
		await Promise.resolve()
		expect(animate).not.toHaveBeenCalled()
		expect(second.setProgress).toHaveBeenCalledWith(snapshot.value.progress)
		expect(car.getShown()).toBe(snapshot.value.progress)
	})

	it('сборка без прогресса не играет вступление, снятие сцены отменяет ход', async () => {
		const { content, animate, stops } = mountCar({ data: stagesData(0) })
		content.value = fakeContent().content
		await Promise.resolve()
		expect(animate).not.toHaveBeenCalled()
		content.value = null
		await Promise.resolve()
		expect(stops).toHaveLength(0)
	})

	it('смена прогресса ведёт машинку к новому значению за длительность × 4', async () => {
		const { content, wrapper, ticks, animate, car } = mountCar({ duration: 100 })
		const built = fakeContent()
		content.value = built.content
		await Promise.resolve()
		ticks[0](10, 0)
		animate.mockClear()
		await wrapper.setProps({ progress: PROGRESS_DONE })
		expect(animate).toHaveBeenCalledOnce()
		const tick = animate.mock.calls[0][0]
		const from = car.getShown()
		expect(tick(0.2, 0)).toBe(true)
		expect(car.getShown()).toBeGreaterThan(from)
		expect(tick(1, 0)).toBe(false)
	})

	it('новый ход отменяет прежний', async () => {
		const { content, wrapper, stops } = mountCar({ duration: 100 })
		content.value = fakeContent().content
		await Promise.resolve()
		await wrapper.setProps({ progress: PROGRESS_DONE })
		await wrapper.setProps({ progress: { version: 1, topics: { html: { status: 'done' } } } })
		expect(stops[0]).toHaveBeenCalled()
	})

	it('уменьшенное движение, нулевая длительность и крошечный сдвиг — сразу в конец', async () => {
		const { content, wrapper, animate, car, settings, snapshot } = mountCar({ isReduced: true })
		content.value = fakeContent().content
		await Promise.resolve()
		expect(animate).not.toHaveBeenCalled()
		await wrapper.setProps({ progress: PROGRESS_DONE })
		expect(animate).not.toHaveBeenCalled()
		expect(car.getShown()).toBe(snapshot.value.progress)
		settings.isReduced = false
		settings.duration = 0
		await wrapper.setProps({ progress: { version: 1, topics: {} } })
		expect(animate).not.toHaveBeenCalled()
		expect(car.getShown()).toBe(snapshot.value.progress)
	})

	it('без собранной сцены смена прогресса ничего не двигает; cancel без хода не падает', async () => {
		const { car, wrapper, animate } = mountCar()
		await wrapper.setProps({ progress: PROGRESS_DONE })
		expect(animate).not.toHaveBeenCalled()
		expect(() => car.cancel()).not.toThrow()
	})
})
