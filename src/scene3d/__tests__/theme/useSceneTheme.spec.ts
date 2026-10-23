import { defineComponent, h } from 'vue'
import { render } from '@testing-library/vue'
import { useSceneTheme } from '../../theme/useSceneTheme'

function mount(onChange: () => void) {
	return render(
		defineComponent({
			setup() {
				useSceneTheme(onChange)
				return () => h('div')
			},
		}),
	)
}

function stubMedia() {
	const media = { addEventListener: vi.fn(), removeEventListener: vi.fn() }
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => media),
	)
	return media
}

afterEach(() => {
	vi.unstubAllGlobals()
	document.documentElement.removeAttribute('data-theme')
	document.documentElement.removeAttribute('data-rise-theme')
})

describe('useSceneTheme', () => {
	it.each(['data-theme', 'data-rise-theme'])('смена атрибута %s вызывает onChange', async attribute => {
		stubMedia()
		const onChange = vi.fn()
		mount(onChange)
		document.documentElement.setAttribute(attribute, 'dark')
		await vi.waitFor(() => expect(onChange).toHaveBeenCalled())
	})

	it('посторонние атрибуты не вызывают onChange', async () => {
		stubMedia()
		const onChange = vi.fn()
		mount(onChange)
		document.documentElement.setAttribute('data-other', '1')
		await new Promise(resolve => setTimeout(resolve, 10))
		document.documentElement.removeAttribute('data-other')
		expect(onChange).not.toHaveBeenCalled()
	})

	it('системная тема: слушатель на prefers-color-scheme, снимается при размонтировании', () => {
		const media = stubMedia()
		const onChange = vi.fn()
		const view = mount(onChange)
		expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
		expect(media.addEventListener).toHaveBeenCalledWith('change', onChange)
		view.unmount()
		expect(media.removeEventListener).toHaveBeenCalledWith('change', onChange)
	})

	it('наблюдатель отключается при размонтировании', async () => {
		stubMedia()
		const onChange = vi.fn()
		const view = mount(onChange)
		view.unmount()
		document.documentElement.setAttribute('data-theme', 'dark')
		await new Promise(resolve => setTimeout(resolve, 10))
		expect(onChange).not.toHaveBeenCalled()
	})

	it('без matchMedia работает только наблюдатель; размонтирование не падает', async () => {
		vi.stubGlobal('matchMedia', undefined)
		const onChange = vi.fn()
		const view = mount(onChange)
		document.documentElement.setAttribute('data-theme', 'light')
		await vi.waitFor(() => expect(onChange).toHaveBeenCalled())
		expect(() => view.unmount()).not.toThrow()
	})
})
