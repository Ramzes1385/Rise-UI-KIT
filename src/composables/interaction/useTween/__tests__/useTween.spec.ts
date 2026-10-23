import type { Ref } from 'vue'
import { useTween } from '../useTween'
import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { TweenValue, UseTweenOptions, UseTweenReturn } from '../types/useTween.types'

function stubReducedMotion(matches: boolean): void {
	const query = { matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => query),
	)
}

function mountTween<T extends TweenValue>(source: Ref<T>, options?: UseTweenOptions<T>): UseTweenReturn<T> & { unmount: () => void } {
	let tween!: UseTweenReturn<T>
	const TestComponent = defineComponent({
		setup() {
			tween = useTween(source, options)
			return () => h('div')
		},
	})
	const { unmount } = render(TestComponent)
	return { ...tween, unmount }
}

describe('useTween', () => {
	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance', 'setTimeout'] })
		stubReducedMotion(false)
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllGlobals()
	})

	it('без from сразу берёт значение источника', () => {
		const tween = mountTween(ref(10))

		expect(tween.value.value).toBe(10)
		expect(tween.isRunning.value).toBe(false)
	})

	it('с from при монтировании идёт к источнику: середина и конец', () => {
		const tween = mountTween(ref(100), { from: 0, duration: 'base', easing: progress => progress })

		expect(tween.value.value).toBe(0)
		expect(tween.isRunning.value).toBe(true)

		vi.advanceTimersByTime(100)
		expect(tween.value.value).toBeGreaterThan(40)
		expect(tween.value.value).toBeLessThan(60)

		vi.advanceTimersByTime(150)
		expect(tween.value.value).toBe(100)
		expect(tween.isRunning.value).toBe(false)
	})

	it('кривая по умолчанию — замедление к концу', () => {
		const tween = mountTween(ref(100), { from: 0 })

		vi.advanceTimersByTime(250)
		expect(tween.value.value).toBeGreaterThan(80)

		vi.advanceTimersByTime(300)
		expect(tween.value.value).toBe(100)
	})

	it('массив: интерполяция поэлементно, пропуски сразу конечные', async () => {
		const source = ref<readonly number[]>([0, 0, Number.NaN])
		const tween = mountTween(source, { easing: progress => progress })

		source.value = [10, 20, 30]
		await nextTick()
		vi.advanceTimersByTime(250)

		const [first, second, third] = tween.value.value
		expect(first).toBeCloseTo(5, 0)
		expect(second).toBeCloseTo(10, 0)
		expect(third).toBe(30)
	})

	it('прерывание продолжает с текущего значения', async () => {
		const source = ref(100)
		const tween = mountTween(source, { from: 0, easing: progress => progress })
		vi.advanceTimersByTime(250)
		const middle = tween.value.value

		source.value = 0
		await nextTick()
		expect(tween.value.value).toBeCloseTo(middle, 5)

		vi.advanceTimersByTime(250)
		expect(tween.value.value).toBeLessThan(middle)
		expect(tween.value.value).toBeGreaterThan(0)

		vi.advanceTimersByTime(300)
		expect(tween.value.value).toBe(0)
	})

	it('массивы разной длины и то же значение — сразу конечное', async () => {
		const source = ref<readonly number[]>([1, 2])
		const tween = mountTween(source)

		source.value = [1, 2, 3]
		await nextTick()
		expect(tween.value.value).toEqual([1, 2, 3])
		expect(tween.isRunning.value).toBe(false)

		source.value = [1, 2, 3]
		await nextTick()
		expect(tween.isRunning.value).toBe(false)
	})

	it('enabled: false — сразу конечное значение', async () => {
		const source = ref(0)
		const tween = mountTween(source, { enabled: false })

		source.value = 50
		await nextTick()

		expect(tween.value.value).toBe(50)
		expect(tween.isRunning.value).toBe(false)
	})

	it('«уменьшить движение» — сразу конечное значение, без кадров', () => {
		stubReducedMotion(true)
		const raf = vi.spyOn(window, 'requestAnimationFrame')

		const tween = mountTween(ref(100), { from: 0 })

		expect(tween.value.value).toBe(100)
		expect(raf).not.toHaveBeenCalled()
	})

	it('replay повторяет переход от from, stop останавливает на месте', () => {
		const tween = mountTween(ref(100), { from: 0, easing: progress => progress })
		vi.advanceTimersByTime(600)
		expect(tween.value.value).toBe(100)

		tween.replay()
		expect(tween.value.value).toBe(0)
		vi.advanceTimersByTime(250)
		tween.stop()
		const stopped = tween.value.value
		vi.advanceTimersByTime(500)

		expect(tween.value.value).toBe(stopped)
		expect(tween.isRunning.value).toBe(false)

		tween.replay(80)
		expect(tween.value.value).toBe(80)
	})

	it('replay без from — от текущего значения, то есть сразу', () => {
		const tween = mountTween(ref(5))

		tween.replay()

		expect(tween.value.value).toBe(5)
		expect(tween.isRunning.value).toBe(false)
	})

	it('при размонтировании отменяет кадр', () => {
		const cancel = vi.spyOn(window, 'cancelAnimationFrame')
		const tween = mountTween(ref(100), { from: 0 })

		tween.unmount()

		expect(cancel).toHaveBeenCalled()
	})
})
