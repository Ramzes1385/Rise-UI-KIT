import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseFooter from '../ui/BaseFooter.vue'
import { render, screen } from '@testing-library/vue'

const COLUMNS = [{ title: 'Продукт', links: [{ label: 'Цены', href: '#prices' }] }]
const SLOTS = { top: 'Логотип', start: '© 2026 Rise', default: 'Ссылки', end: 'Соцсети' }
const PARTS = ['top', 'about', 'columns', 'column', 'column-title', 'links', 'inner', 'start', 'center', 'end'] as const

const part = (name: string) => document.querySelector(`.base-footer__${name}`)

describe('BaseFooter: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		render(BaseFooter, { props: { columns: COLUMNS }, slots: SLOTS })

		expect(screen.getByRole('contentinfo')).toHaveAttribute('class', 'base-footer')
		expect(part('about')).toHaveAttribute('class', 'base-footer__about')
		expect(part('column-title')).toHaveAttribute('class', 'base-footer__column-title')
		expect(part('start')).toHaveAttribute('class', 'base-footer__start')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(name => [name, `u-${name}`])])
		render(BaseFooter, {
			props: { columns: COLUMNS, variant: 'soft', isCompact: true, customClass: { root: 'own-root', inner: 'own-inner' }, ui },
			slots: SLOTS,
		})

		expect(screen.getByRole('contentinfo')).toHaveClass(
			'base-footer',
			'u-root',
			'base-footer--soft',
			'base-footer--compact',
			'own-root',
		)
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-footer__${name}`, `u-${name}`)
		expect(part('inner')).toHaveClass('base-container', 'own-inner')
	})

	it('классы из defaults.BaseFooter.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseFooter, {
			props: { ui: { start: 'own-start' } },
			slots: { start: '© 2026 Rise' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseFooter: { ui: { root: 'app-root', start: 'app-start' } } } })] },
		})

		expect(screen.getByRole('contentinfo')).toHaveClass('base-footer', 'app-root')
		expect(part('start')).toHaveAttribute('class', 'base-footer__start app-start own-start')
	})
})
