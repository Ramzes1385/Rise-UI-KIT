import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseBankCard from '../ui/BaseBankCard.vue'

const PROPS = { brand: 'visa' as const, last4: '4242', expiry: '01/20', holder: 'IVAN IVANOV', label: 'Основная', isExpired: true }
const PARTS = ['summary', 'brand', 'label', 'number', 'holder', 'expiry', 'expired'] as const

const part = (container: Element, name: string) => container.querySelector(`.base-bank-card__${name}`)

describe('BaseBankCard: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		const { container } = render(BaseBankCard, { props: PROPS })

		expect(container.querySelector('.base-bank-card')?.className).toMatch(/^base-bank-card /)
		for (const name of PARTS) expect(part(container, name)).toHaveAttribute('class', `base-bank-card__${name}`)
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(name => [name, `u-${name}`])])
		const { container } = render(BaseBankCard, {
			props: { ...PROPS, isCompact: true, variant: 'soft', customClass: { root: 'own-root', number: 'own-number' }, ui },
		})

		expect(container.querySelector('.base-bank-card')).toHaveClass(
			'base-bank-card',
			'u-root',
			'base-bank-card--soft',
			'base-bank-card--compact',
			'base-bank-card--expired',
			'own-root',
		)
		for (const name of PARTS.filter(name => name !== 'holder')) expect(part(container, name)).toHaveClass(`u-${name}`)
		expect(part(container, 'number')).toHaveClass('own-number')
	})

	it('классы из defaults.BaseBankCard.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseBankCard, {
			props: { ...PROPS, ui: { number: 'own-number' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseBankCard: { ui: { root: 'app-root', number: 'app-number' } } } })] },
		})

		expect(container.querySelector('.base-bank-card')).toHaveClass('app-root')
		expect(part(container, 'number')).toHaveAttribute('class', 'base-bank-card__number app-number own-number')
	})
})
