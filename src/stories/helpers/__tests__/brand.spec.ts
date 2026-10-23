import { nextTick, ref } from 'vue'
import type { ThemeInput } from '@utils/theme/themeUtils'
import { THEME_STYLE_ATTRIBUTE } from '@composables/app/useTheme'
import { applyStoryBrand, watchCustomBrand } from '../theme/brand'

const root = document.documentElement
const STORAGE_KEY = 'rise-storybook:custom-theme'
const styleOf = (name: string): HTMLStyleElement | null => document.head.querySelector(`style[${THEME_STYLE_ATTRIBUTE}="${name}"]`)

describe('бренд историй', () => {
	beforeEach(() => {
		localStorage.clear()
		root.removeAttribute('data-rise-theme')
		root.setAttribute('data-theme', 'dark')
		document.head.querySelectorAll(`style[${THEME_STYLE_ATTRIBUTE}]`).forEach(style => style.remove())
	})

	it('пресет ставит data-rise-theme и <style> темы, режим не трогает', () => {
		applyStoryBrand('corporate')
		expect(root.getAttribute('data-rise-theme')).toBe('corporate')
		expect(root.getAttribute('data-theme')).toBe('dark')
		expect(styleOf('corporate')?.textContent).toContain("[data-rise-theme='corporate'][data-rise-theme]")
	})

	it('rise и неизвестное значение снимают бренд: вид кита как есть', () => {
		applyStoryBrand('playful')
		applyStoryBrand('rise')
		expect(root.hasAttribute('data-rise-theme')).toBe(false)
		applyStoryBrand('playful')
		applyStoryBrand(undefined)
		expect(root.hasAttribute('data-rise-theme')).toBe(false)
	})

	it('custom без конструктора — входы пресета corporate, в том числе при испорченном хранилище', () => {
		localStorage.setItem(STORAGE_KEY, '{')
		applyStoryBrand('custom')
		expect(root.getAttribute('data-rise-theme')).toBe('custom')
		expect(styleOf('custom')?.textContent).toContain('--rise-color-primary-700: #1d4ed8')
	})

	it('конструктор сохраняет входы для custom и сразу обновляет выбранный бренд custom', async () => {
		const input = ref<ThemeInput>({ name: 'brand', primary: '#7c3aed' })
		watchCustomBrand(input)
		expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual({ name: 'custom', primary: '#7c3aed' })

		applyStoryBrand('custom')
		input.value = { name: 'brand', primary: '#0f766e', radius: 'lg' }
		await nextTick()
		expect(styleOf('custom')?.textContent).toContain('--rise-radius: 8px')
	})

	it('закрытое хранилище не ломает конструктор', () => {
		const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new Error('closed')
		})
		expect(() => watchCustomBrand(ref<ThemeInput>({ name: 'brand', primary: '#7c3aed' }))).not.toThrow()
		setItem.mockRestore()
	})
})
