import { nextTick, ref } from 'vue'
import { withSetup } from './BaseMediaPlayer.test-utils'
import { useIdleControls } from '../model/useIdleControls'

function setup(target: HTMLElement | null = document.createElement('div')) {
	const canHide = ref(false)
	const { result, wrapper } = withSetup(() => useIdleControls(ref(target), { timeout: () => 1000, canHide: () => canHide.value }))
	return { target, canHide, wrapper, ...result }
}

describe('useIdleControls', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('скрывает после бездействия, пока скрывать можно; активность показывает снова', async () => {
		const { target, canHide, isIdle } = setup()

		canHide.value = true
		await nextTick()
		vi.advanceTimersByTime(999)
		expect(isIdle.value).toBe(false)
		vi.advanceTimersByTime(1)
		expect(isIdle.value).toBe(true)

		target!.dispatchEvent(new Event('pointermove'))
		expect(isIdle.value).toBe(false)
		target!.dispatchEvent(new Event('pointerleave'))
		vi.advanceTimersByTime(1000)
		expect(isIdle.value).toBe(true)
	})

	it('пока скрывать нельзя, не скрывает; запрет показывает сразу', async () => {
		const { target, canHide, isIdle, wake } = setup()

		target!.dispatchEvent(new Event('keydown'))
		vi.advanceTimersByTime(1000)
		expect(isIdle.value).toBe(false)

		canHide.value = true
		await nextTick()
		wake()
		vi.advanceTimersByTime(1000)
		expect(isIdle.value).toBe(true)
		canHide.value = false
		await nextTick()
		expect(isIdle.value).toBe(false)
	})

	it('после размонтирования таймер и обработчики сняты; без элемента не падает', async () => {
		const { target, canHide, isIdle, wrapper } = setup()

		canHide.value = true
		await nextTick()
		wrapper.unmount()
		target!.dispatchEvent(new Event('pointerdown'))
		vi.advanceTimersByTime(1000)
		expect(isIdle.value).toBe(false)

		expect(setup(null).isIdle.value).toBe(false)
	})
})
