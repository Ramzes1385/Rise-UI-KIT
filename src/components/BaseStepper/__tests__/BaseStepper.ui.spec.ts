import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseStepper from '../ui/BaseStepper.vue'

const ITEMS = [{ label: 'Корзина', description: 'Товары' }, { label: 'Доставка' }, { label: 'Оплата' }]

describe('BaseStepper: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseStepper, { props: { modelValue: 2, items: ITEMS } })

		expect(container.querySelector('.base-stepper__items')).toHaveAttribute('class', 'base-stepper__items')
		expect(container.querySelector('.base-stepper__indicator')).toHaveAttribute('class', 'base-stepper__indicator')
		expect(container.querySelector('.base-stepper__label')).toHaveAttribute('class', 'base-stepper__label')
		expect(container.querySelector('.base-stepper__line-fill--end')).toHaveAttribute(
			'class',
			'base-stepper__line-fill base-stepper__line-fill--end',
		)
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseStepper, {
			props: {
				modelValue: 2,
				items: ITEMS,
				variant: 'animated',
				customClass: { root: 'own-root', label: 'own-label' },
				ui: { root: 'u-root', label: 'u-label', indicator: 'u-indicator', 'line-fill': 'u-fill', step: 'u-step' },
			},
			slots: { header: 'Заголовок', footer: 'Подвал' },
		})

		expect(container.querySelector('.base-stepper')).toHaveClass('base-stepper', 'u-root', 'base-stepper--animated', 'own-root')
		expect(container.querySelector('.base-stepper__label')).toHaveClass('u-label', 'own-label')
		expect(container.querySelector('.base-stepper__indicator')).toHaveClass('u-indicator')
		expect(container.querySelector('.base-stepper__step')).toHaveClass('u-step', 'base-stepper__step--passed')
		expect(container.querySelectorAll('.u-fill')).toHaveLength(4)
	})

	it('классы из defaults.BaseStepper.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseStepper, {
			props: { modelValue: 1, items: ITEMS, ui: { label: 'own-label' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseStepper: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})

		expect(container.querySelector('.base-stepper')).toHaveClass('app-root')
		expect(container.querySelector('.base-stepper__label')).toHaveAttribute('class', 'base-stepper__label app-label own-label')
	})
})
