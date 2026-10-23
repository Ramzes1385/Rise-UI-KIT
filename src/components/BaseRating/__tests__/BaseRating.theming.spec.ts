import '@testing-library/jest-dom/vitest'
import BaseRating from '../ui/BaseRating.vue'
import { render } from '@testing-library/vue'
import { RATING_PARTS } from '../types/BaseRating.types'
import { DEFAULTS_KEY } from '@composables/base/useDefaults'

describe('BaseRating: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...RATING_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseRating, {
			props: { modelValue: 3, isValueShown: true, variant: 'soft', customClass: { root: 'own-root', value: 'own-value' }, ui },
		})
		const root = container.querySelector('.base-rating')!

		expect(root).toHaveClass('u-root', 'base-rating--soft', 'own-root')
		for (const part of RATING_PARTS) expect(root.querySelector(`.base-rating__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-rating__value')).toHaveClass('own-value')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseRating, {
			props: { modelValue: 3, ui: { star: 'own' } },
			global: { provide: { [DEFAULTS_KEY]: { BaseRating: { ui: { star: 'app', root: 'app-root' } } } } },
		})
		const root = container.querySelector('.base-rating')!

		expect(root).toHaveClass('base-rating', 'app-root')
		expect(root.querySelector('.base-rating__star-fill')).toHaveAttribute('class', 'base-rating__star-fill')
		expect(root.querySelector('.base-rating__star')).toHaveAttribute('class', 'base-rating__star app own')
	})
})

describe('BaseRating: заливка и число без рывка', () => {
	it('заливка звезды — переменная --rating-fill-size для clip-path, а не ширина', () => {
		const { container } = render(BaseRating, { props: { modelValue: 2.5, step: 0.5 } })
		const fills = [...container.querySelectorAll<HTMLElement>('.base-rating__star-fill')]

		expect(fills.map(fill => fill.style.getPropertyValue('--rating-fill-size'))).toEqual(['100%', '100%', '50%', '0%', '0%'])
		expect(fills[2].style.width).toBe('')
	})

	it('ширина числа — по самой длинной подписи: максимум с десятичными знаками шага', () => {
		const { container } = render(BaseRating, { props: { modelValue: 9.5, max: 10, step: 0.5, isValueShown: true } })

		expect(container.querySelector('.base-rating__value')).toHaveStyle({ '--rating-value-chars': '4' })
	})
})
