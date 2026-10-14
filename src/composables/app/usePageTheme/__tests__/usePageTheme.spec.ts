import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick } from 'vue'
import { usePageTheme, usePageThemeStamp } from '../usePageTheme'

type Listener = () => void

function stubMatchMedia() {
	const listeners = new Set<Listener>()
	const query = {
		addEventListener: vi.fn((_type: string, listener: Listener) => listeners.add(listener)),
		removeEventListener: vi.fn((_type: string, listener: Listener) => listeners.delete(listener)),
	}
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => query),
	)
	return { query, listeners, change: (): void => listeners.forEach(listener => listener()) }
}

describe('usePageTheme', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-theme')
		document.documentElement.removeAttribute('data-rise-theme')
		document.documentElement.removeAttribute('lang')
	})

	it('вызывает onChange при смене data-theme и data-rise-theme, на других атрибутах молчит', async () => {
		stubMatchMedia()
		const onChange = vi.fn()
		render(defineComponent({ setup: () => (usePageTheme(onChange), () => h('div')) }))

		document.documentElement.setAttribute('data-theme', 'dark')
		await nextTick()
		await Promise.resolve()
		expect(onChange).toHaveBeenCalledTimes(1)

		document.documentElement.setAttribute('data-rise-theme', 'corporate')
		await Promise.resolve()
		expect(onChange).toHaveBeenCalledTimes(2)

		document.documentElement.setAttribute('lang', 'ru')
		await Promise.resolve()
		expect(onChange).toHaveBeenCalledTimes(2)
	})

	it('учитывает свой список атрибутов', async () => {
		stubMatchMedia()
		const onChange = vi.fn()
		render(defineComponent({ setup: () => (usePageTheme(onChange, ['data-theme']), () => h('div')) }))

		document.documentElement.setAttribute('data-rise-theme', 'corporate')
		await Promise.resolve()
		expect(onChange).not.toHaveBeenCalled()

		document.documentElement.setAttribute('data-theme', 'light')
		await Promise.resolve()
		expect(onChange).toHaveBeenCalledTimes(1)
	})

	it('реагирует на prefers-color-scheme и снимает подписки при размонтировании', async () => {
		const { query, listeners, change } = stubMatchMedia()
		const onChange = vi.fn()
		const { unmount } = render(defineComponent({ setup: () => (usePageTheme(onChange), () => h('div')) }))

		change()
		expect(onChange).toHaveBeenCalledTimes(1)

		unmount()
		expect(query.removeEventListener).toHaveBeenCalledWith('change', onChange)
		expect(listeners.size).toBe(0)

		document.documentElement.setAttribute('data-theme', 'dark')
		await Promise.resolve()
		expect(onChange).toHaveBeenCalledTimes(1)
	})

	it('без matchMedia следит только за атрибутами', async () => {
		vi.stubGlobal('matchMedia', undefined)
		const onChange = vi.fn()
		const { unmount } = render(defineComponent({ setup: () => (usePageTheme(onChange), () => h('div')) }))

		document.documentElement.setAttribute('data-theme', 'dark')
		await Promise.resolve()
		expect(onChange).toHaveBeenCalledTimes(1)
		expect(() => unmount()).not.toThrow()
	})
})

describe('usePageThemeStamp', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-theme')
	})

	it('растёт на 1 при каждой смене темы', async () => {
		const { change } = stubMatchMedia()
		let stamp!: Readonly<{ value: number }>
		render(
			defineComponent({
				setup() {
					stamp = usePageThemeStamp()
					return () => h('div')
				},
			}),
		)
		expect(stamp.value).toBe(0)

		change()
		expect(stamp.value).toBe(1)

		document.documentElement.setAttribute('data-theme', 'dark')
		await Promise.resolve()
		expect(stamp.value).toBe(2)
	})
})
