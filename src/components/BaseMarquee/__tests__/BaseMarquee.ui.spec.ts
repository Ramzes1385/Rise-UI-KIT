import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseMarquee from '../ui/BaseMarquee.vue'

const ITEMS = ['Первая', 'Вторая']
const SLOTS = { separator: '•' }

describe('BaseMarquee: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseMarquee, { props: { items: ITEMS }, slots: SLOTS })
		const root = container.querySelector('.base-marquee')!

		expect(root.className).toMatch(/^base-marquee /)
		for (const part of ['viewport', 'track', 'group', 'item', 'separator']) {
			expect(root.querySelector(`.base-marquee__${part}`)).toHaveAttribute('class', `base-marquee__${part}`)
		}
		expect(root.querySelector('.base-marquee__button')).toHaveClass('base-marquee__button')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = {
			root: 'u-root',
			viewport: 'u-viewport',
			track: 'u-track',
			group: 'u-group',
			item: 'u-item',
			separator: 'u-separator',
			button: 'u-button',
		}
		const { container } = render(BaseMarquee, {
			props: { items: ITEMS, variant: 'soft', customClass: { root: 'own-root', item: 'own-item' }, ui },
			slots: SLOTS,
		})
		const root = container.querySelector('.base-marquee')!

		expect(root).toHaveClass('u-root', 'base-marquee--soft', 'own-root')
		for (const part of ['viewport', 'track', 'group', 'item', 'separator', 'button']) {
			expect(root.querySelector(`.base-marquee__${part}`)).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-marquee__item')).toHaveClass('own-item')
	})

	it('классы из defaults.BaseMarquee.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseMarquee, {
			props: { items: ITEMS, ui: { item: 'own-item' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseMarquee: { ui: { root: 'app-root', item: 'app-item' } } } })] },
		})
		const root = container.querySelector('.base-marquee')!

		expect(root).toHaveClass('app-root')
		expect(root.querySelector('.base-marquee__item')).toHaveAttribute('class', 'base-marquee__item app-item own-item')
	})
})
