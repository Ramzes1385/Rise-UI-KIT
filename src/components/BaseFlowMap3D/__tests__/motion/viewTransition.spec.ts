import { render } from '@testing-library/vue'
import { useViewDefer } from '../../model/motion/view/useViewDefer'
import type { FlowMap3DView } from '../../types/BaseFlowMap3D.types'
import { computed, defineComponent, effectScope, nextTick, ref } from 'vue'
import { useViewTransition } from '../../model/motion/view/useViewTransition'

function setupDefer(hasFallback = false) {
	const target = ref<FlowMap3DView>('3d')
	let defer!: ReturnType<typeof useViewDefer>
	const Host = defineComponent({
		setup() {
			defer = useViewDefer({ targetView: computed(() => target.value), hasFallback: () => hasFallback })
			return () => null
		},
	})
	const { unmount } = render(Host)
	return { target, defer, unmount }
}

describe('useViewDefer', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('без отложителя вид меняется сразу и без затухания', () => {
		const { target, defer } = setupDefer()
		target.value = '2d'
		expect(defer.shownView.value).toBe('2d')
		expect(defer.isFading.value).toBe(false)
	})

	it('отложитель с ожиданием меняет вид позже, с затуханием — держит оба вида', () => {
		const { target, defer } = setupDefer()
		defer.setDeferrer({ wait: () => 500, fade: () => 200 })
		target.value = '2d'
		expect(defer.shownView.value).toBe('3d')
		vi.advanceTimersByTime(500)
		expect(defer.shownView.value).toBe('2d')
		expect(defer.isFading.value).toBe(true)
		vi.advanceTimersByTime(200)
		expect(defer.isFading.value).toBe(false)
	})

	it('если вид уже тот, смена без ожидания ничего не делает; новая смена сбрасывает ожидание', () => {
		const { target, defer } = setupDefer()
		defer.setDeferrer({ wait: next => (next === '2d' ? 500 : 0), fade: () => 0 })
		target.value = '2d'
		target.value = '3d'
		vi.advanceTimersByTime(1000)
		expect(defer.shownView.value).toBe('3d')
		defer.setDeferrer(null)
		target.value = '3d'
		expect(defer.shownView.value).toBe('3d')
	})

	it('при откате на 2D затухание не нужно', () => {
		const { target, defer } = setupDefer(true)
		defer.setDeferrer({ wait: () => 0, fade: () => 300 })
		target.value = '2d'
		expect(defer.shownView.value).toBe('2d')
		expect(defer.isFading.value).toBe(false)
	})

	it('при размонтировании таймеры гасятся', async () => {
		const { target, defer, unmount } = setupDefer()
		defer.setDeferrer({ wait: () => 500, fade: () => 0 })
		target.value = '2d'
		unmount()
		await nextTick()
		vi.advanceTimersByTime(1000)
		expect(vi.getTimerCount()).toBe(0)
	})
})

function setupTransition(parts: { flight?: number; reason?: string | null } = {}) {
	const deferrers: Array<{ wait: (next: FlowMap3DView, current: FlowMap3DView) => number; fade: () => number }> = []
	const shownView = ref<FlowMap3DView>('3d')
	const camera = { flyTo2d: vi.fn(), flyFrom2d: vi.fn() }
	const view = {
		setDeferrer: (next: (typeof deferrers)[number]) => deferrers.push(next),
		shownView,
		fallback: { reason: ref(parts.reason ?? null) },
	}
	const scope = effectScope()
	const transition = scope.run(() =>
		useViewTransition({
			view: view as never,
			camera: camera as never,
			getPreset: () => 'iso-90',
			getFlightMs: () => parts.flight ?? 500,
			getFadeMs: () => 200,
		}),
	)!
	return { deferrers, camera, shownView, transition }
}

describe('useViewTransition', () => {
	it('переход 3D → 2D сначала летит камерой и ждёт конец полёта', () => {
		const { deferrers, camera } = setupTransition()
		expect(deferrers[0].wait('2d', '3d')).toBe(500)
		expect(camera.flyTo2d).toHaveBeenCalledOnce()
		expect(deferrers[0].fade()).toBe(200)
	})

	it('отмена перехода (3D → 3D) во время полёта возвращает камеру в пресет', () => {
		const { deferrers, camera } = setupTransition()
		deferrers[0].wait('2d', '3d')
		expect(deferrers[0].wait('3d', '3d')).toBe(0)
		expect(camera.flyFrom2d).toHaveBeenCalledWith('iso-90')
	})

	it('без полёта, при отказе рендерера и при смене 2D → 3D ожидания нет', () => {
		const still = setupTransition({ flight: 0 })
		expect(still.deferrers[0].wait('2d', '3d')).toBe(0)
		const broken = setupTransition({ reason: 'error' })
		expect(broken.deferrers[0].wait('2d', '3d')).toBe(0)
		const back = setupTransition()
		expect(back.deferrers[0].wait('3d', '2d')).toBe(0)
		expect(back.deferrers[0].wait('3d', '3d')).toBe(0)
		expect(back.camera.flyFrom2d).not.toHaveBeenCalled()
	})

	it('смена показанного вида гасит признак полёта', async () => {
		const { deferrers, camera, shownView } = setupTransition()
		deferrers[0].wait('2d', '3d')
		shownView.value = '2d'
		await nextTick()
		expect(deferrers[0].wait('3d', '3d')).toBe(0)
		expect(camera.flyFrom2d).not.toHaveBeenCalled()
	})

	it('прибытие в 3D вылетает из кадра 2D в пресет, если полёты включены', () => {
		const flying = setupTransition()
		flying.transition.arrive()
		expect(flying.camera.flyFrom2d).toHaveBeenCalledWith('iso-90')
		const still = setupTransition({ flight: 0 })
		still.transition.arrive()
		expect(still.camera.flyFrom2d).not.toHaveBeenCalled()
	})
})
