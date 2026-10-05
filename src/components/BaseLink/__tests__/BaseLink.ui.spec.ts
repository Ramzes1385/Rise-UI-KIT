import '@/styles/_motion.scss'
import '@testing-library/jest-dom/vitest'
import BaseLink from '../ui/BaseLink.vue'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'

function transitionDuration(element: Element): string {
	const style = getComputedStyle(element)
	const token = /^var\((--[\w-]+)\)$/.exec(style.transitionDuration)?.[1]
	return token ? style.getPropertyValue(token).trim() : style.transitionDuration
}

describe('BaseLink: проп ui', () => {
	it('без ui — только классы кита', () => {
		render(BaseLink, { props: { href: 'https://example.com', target: '_blank', label: 'Руководство' } })
		const link = screen.getByRole('link')

		expect(link).toHaveAttribute('class', 'base-link')
		expect(link.querySelector('.base-link__external')).toHaveAttribute('class', 'base-link__external')
		expect(link.querySelector('.base-link__hint')).toHaveAttribute('class', 'base-link__hint')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		render(BaseLink, {
			props: {
				href: 'https://example.com',
				target: '_blank',
				label: 'Руководство',
				variant: 'ghost',
				customClass: { root: 'own-root', external: 'own-external' },
				ui: { root: 'u-root', external: 'u-external', hint: 'u-hint' },
			},
		})
		const link = screen.getByRole('link')

		expect(link).toHaveClass('base-link', 'u-root', 'base-link--ghost', 'own-root')
		expect(link.querySelector('.base-link__external')).toHaveClass('u-external', 'own-external')
		expect(link.querySelector('.base-link__hint')).toHaveAttribute('class', 'base-link__hint u-hint')
	})

	it('классы из defaults.BaseLink.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseLink, {
			props: { href: '/docs', label: 'Документация', ui: { root: 'own-root' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseLink: { ui: { root: 'app-root' } } } })] },
		})

		expect(screen.getByRole('link')).toHaveAttribute('class', 'base-link app-root own-root')
	})
})

describe('BaseLink: переход цвета и подчёркивания при наведении', () => {
	afterEach(() => {
		document.documentElement.removeAttribute('data-rise-motion')
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('цвет и цвет подчёркивания меняются переходом на токене --rise-duration-fast', () => {
		render(BaseLink, { props: { href: '/docs', label: 'Документация' } })
		const style = getComputedStyle(screen.getByRole('link'))

		expect(style.transitionProperty).toContain('color')
		expect(style.transitionProperty).toContain('text-decoration-color')
		expect(style.transitionDuration).toBe('var(--rise-duration-fast)')
		expect(style.transitionTimingFunction).toBe('var(--rise-ease)')
		expect(transitionDuration(screen.getByRole('link'))).toBe('150ms')
	})

	it.each([
		["reducedMotion: 'always'", () => document.documentElement.setAttribute('data-rise-reduced-motion', 'always')],
		['пресет none', () => document.documentElement.setAttribute('data-rise-motion', 'none')],
	])('%s — переход нулевой, наведение сразу даёт конечный цвет', (_, setup) => {
		setup()
		render(BaseLink, { props: { href: '/docs', label: 'Документация', variant: 'ghost' } })

		expect(transitionDuration(screen.getByRole('link'))).toBe('0.01ms')
	})
})
