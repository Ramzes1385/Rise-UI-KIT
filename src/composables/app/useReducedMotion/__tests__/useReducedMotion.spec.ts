import type { Ref } from 'vue'
import { render } from '@testing-library/vue'
import { useReducedMotion } from '../useReducedMotion'
import { defineComponent, h, isReadonly, nextTick } from 'vue'

type ChangeListener = (event: MediaQueryListEvent) => void

function stubMatchMedia(matches: boolean) {
	const listeners = new Set<ChangeListener>()
	const query = {
		matches,
		addEventListener: vi.fn((_type: string, listener: ChangeListener) => listeners.add(listener)),
		removeEventListener: vi.fn((_type: string, listener: ChangeListener) => listeners.delete(listener)),
	}
	const matchMedia = vi.fn(() => query)
	vi.stubGlobal('matchMedia', matchMedia)
	const change = (value: boolean): void => listeners.forEach(listener => listener({ matches: value } as MediaQueryListEvent))
	return { query, matchMedia, listeners, change }
}

function mountComposable(): { isReduced: Readonly<Ref<boolean>>; unmount: () => void; before: boolean } {
	let isReduced!: Readonly<Ref<boolean>>
	let before = true
	const TestComponent = defineComponent({
		setup() {
			isReduced = useReducedMotion()
			before = isReduced.value
			return () => h('div')
		},
	})
	const { unmount } = render(TestComponent)
	return { isReduced, unmount, before }
}

describe('useReducedMotion', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('до монтирования — false, после — текущее значение настройки', () => {
		const { matchMedia } = stubMatchMedia(true)

		const { isReduced, before } = mountComposable()

		expect(before).toBe(false)
		expect(isReduced.value).toBe(true)
		expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
	})

	it('без уменьшения движения — false', () => {
		stubMatchMedia(false)

		expect(mountComposable().isReduced.value).toBe(false)
	})

	it('меняется вместе с настройкой системы', async () => {
		const { change } = stubMatchMedia(false)
		const { isReduced } = mountComposable()

		change(true)
		await nextTick()
		expect(isReduced.value).toBe(true)

		change(false)
		await nextTick()
		expect(isReduced.value).toBe(false)
	})

	it('при размонтировании снимает подписку', () => {
		const { query, listeners } = stubMatchMedia(false)
		const { unmount } = mountComposable()
		expect(listeners.size).toBe(1)

		unmount()

		expect(query.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
		expect(listeners.size).toBe(0)
	})

	it('без matchMedia остаётся false и размонтируется без ошибок', () => {
		vi.stubGlobal('matchMedia', undefined)
		const { isReduced, unmount } = mountComposable()

		expect(isReduced.value).toBe(false)
		expect(() => unmount()).not.toThrow()
	})

	it('отдаёт значение только для чтения', () => {
		stubMatchMedia(false)

		expect(isReadonly(mountComposable().isReduced)).toBe(true)
	})
})
