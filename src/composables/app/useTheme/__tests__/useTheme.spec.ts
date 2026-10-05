import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTheme, THEME_PRESETS } from '@utils/theme/themeUtils'
import { applyTheme, createThemeController, THEME_STYLE_ATTRIBUTE } from '../useTheme'

const brand = createTheme({ name: 'brand', primary: '#0f766e' })

function styles(): HTMLStyleElement[] {
	return [...document.head.querySelectorAll<HTMLStyleElement>(`style[${THEME_STYLE_ATTRIBUTE}]`)]
}

afterEach(() => {
	for (const style of styles()) style.remove()
	document.documentElement.removeAttribute('data-rise-theme')
	document.documentElement.removeAttribute('data-theme')
	document.body.innerHTML = ''
})

describe('applyTheme', () => {
	it('вставляет CSS темы в head и ставит data-rise-theme и data-theme=system на html', () => {
		applyTheme(brand)
		expect(styles()).toHaveLength(1)
		expect(styles()[0].getAttribute(THEME_STYLE_ATTRIBUTE)).toBe('brand')
		expect(styles()[0].textContent).toBe(brand.css)
		expect(document.documentElement.getAttribute('data-rise-theme')).toBe('brand')
		expect(document.documentElement.getAttribute('data-theme')).toBe('system')
	})

	it('повторный вызов той же темы переиспользует style и ставит nonce', () => {
		applyTheme(brand)
		applyTheme(brand, { nonce: 'abc' })
		expect(styles()).toHaveLength(1)
		expect(styles()[0].nonce).toBe('abc')
	})

	it('существующий data-theme области не меняется', () => {
		document.documentElement.setAttribute('data-theme', 'dark')
		applyTheme(brand)
		expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
	})

	it('область без data-theme получает режим ближайшего предка', () => {
		document.body.innerHTML = '<div data-theme="dark"><section id="area"></section></div>'
		const area = document.getElementById('area') as HTMLElement
		applyTheme(brand, { target: area })
		expect(area.getAttribute('data-rise-theme')).toBe('brand')
		expect(area.getAttribute('data-theme')).toBe('dark')
		expect(document.documentElement.hasAttribute('data-rise-theme')).toBe(false)
	})

	it('без document (SSR) ничего не делает', () => {
		vi.stubGlobal('document', undefined)
		expect(() => applyTheme(brand)).not.toThrow()
		vi.unstubAllGlobals()
		expect(styles()).toHaveLength(0)
	})
})

describe('createThemeController', () => {
	it('до выбора темы — null и пустой CSS; список — пресеты', () => {
		const controller = createThemeController()
		expect(controller.theme.value).toBeNull()
		expect(controller.css.value).toBe('')
		expect(controller.themes.value).toEqual(['rise', 'corporate', 'playful', 'minimal'])
	})

	it('setTheme по имени пресета создаёт и подключает тему', () => {
		const controller = createThemeController()
		expect(controller.setTheme('playful')).toBe(true)
		expect(controller.theme.value).toBe('playful')
		expect(controller.css.value).toBe(createTheme(THEME_PRESETS.playful).css)
		expect(document.documentElement.getAttribute('data-rise-theme')).toBe('playful')
	})

	it('свои темы из настроек доступны по имени и в списке', () => {
		const controller = createThemeController({ themes: [brand], nonce: 'n1' })
		expect(controller.themes.value).toContain('brand')
		expect(controller.setTheme('brand')).toBe(true)
		expect(styles()[0].nonce).toBe('n1')
	})

	it('готовая тема регистрируется при выборе', () => {
		const controller = createThemeController()
		const custom = createTheme({ name: 'custom', primary: '#be123c' })
		controller.setTheme(custom)
		expect(controller.themes.value).toContain('custom')
		expect(controller.css.value).toBe(custom.css)
	})

	it('неизвестное имя — false, тема не меняется', () => {
		const controller = createThemeController()
		controller.setTheme('rise')
		expect(controller.setTheme('unknown')).toBe(false)
		expect(controller.theme.value).toBe('rise')
	})

	it('target ставит тему на свой элемент; configure меняет nonce и добавляет темы', () => {
		document.body.innerHTML = '<main id="app"></main>'
		const app = document.getElementById('app') as HTMLElement
		const controller = createThemeController({ target: () => app })
		controller.configure({ themes: [brand], nonce: 'n2' })
		controller.configure({})
		controller.setTheme('brand')
		expect(app.getAttribute('data-rise-theme')).toBe('brand')
		expect(styles()[0].nonce).toBe('n2')
	})

	it('target без элемента — тема на html', () => {
		const controller = createThemeController({ target: () => null })
		controller.setTheme('minimal')
		expect(document.documentElement.getAttribute('data-rise-theme')).toBe('minimal')
	})
})

describe('useTheme', () => {
	it('одно общее управление; themes из следующих вызовов добавляются', async () => {
		vi.resetModules()
		const { useTheme } = await import('../useTheme')
		const first = useTheme()
		const second = useTheme({ themes: [brand] })
		expect(second).toBe(first)
		expect(first.themes.value).toContain('brand')
	})
})
