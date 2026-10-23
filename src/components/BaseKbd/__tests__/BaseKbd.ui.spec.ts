import '@testing-library/jest-dom/vitest'
import BaseKbd from '../ui/BaseKbd.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'

describe('BaseKbd: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseKbd, { props: { value: 'shift' } })
		const kbd = container.querySelector('kbd')!

		expect(kbd).toHaveAttribute('class', 'base-kbd')
		expect(kbd.querySelector('.base-kbd__name')).toHaveAttribute('class', 'base-kbd__name')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseKbd, {
			props: { value: 'shift', variant: 'soft', customClass: 'own-root', ui: { root: 'u-root', name: 'u-name' } },
		})
		const kbd = container.querySelector('kbd')!

		expect(kbd).toHaveClass('base-kbd', 'u-root', 'base-kbd--soft', 'own-root')
		expect(kbd.querySelector('.base-kbd__name')).toHaveClass('u-name')
	})

	it('классы из defaults.BaseKbd.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseKbd, {
			props: { value: 'enter', ui: { name: 'own-name' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseKbd: { ui: { root: 'app-root', name: 'app-name' } } } })] },
		})
		const kbd = container.querySelector('kbd')!

		expect(kbd).toHaveClass('base-kbd', 'app-root')
		expect(kbd.querySelector('.base-kbd__name')).toHaveAttribute('class', 'base-kbd__name app-name own-name')
	})
})
