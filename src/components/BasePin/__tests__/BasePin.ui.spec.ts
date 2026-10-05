import '@testing-library/jest-dom/vitest'
import BasePin from '../ui/BasePin.vue'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'

const PARTS = ['cells', 'input', 'error-text'] as const

describe('BasePin: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BasePin, { props: { modelValue: '12', error: 'Ошибка', variant: 'soft', ui } })
		const root = container.querySelector('.base-pin')!

		expect(root).toHaveClass('u-root', 'base-pin--soft', 'base-pin--error')
		for (const part of PARTS) expect(root.querySelector(`.base-pin__${part}`), part).toHaveClass(`u-${part}`)
		for (const input of root.querySelectorAll('.base-pin__input')) expect(input).toHaveClass('u-input')
	})

	it('без ui — только класс кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BasePin, {
			props: { modelValue: '', ui: { input: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BasePin: { ui: { input: 'app', cells: 'app-cells' } } } })] },
		})

		expect(container.querySelector('.base-pin')!.className).not.toMatch(/app|own/)
		expect(container.querySelector('.base-pin__cells')).toHaveClass('app-cells')
		expect(container.querySelector('.base-pin__input')).toHaveAttribute('class', 'base-pin__input app own')
	})
})
