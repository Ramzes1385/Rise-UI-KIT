import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseButton from '../ui/BaseButton.vue'
import { render, screen } from '@testing-library/vue'

const SLOTS = { default: 'Сохранить', left: '<i>л</i>', right: '<i>п</i>' }

describe('BaseButton: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		render(BaseButton, { props: { isLoading: true }, slots: SLOTS })
		const button = screen.getByRole('button')

		expect(button.className).toMatch(/^base-button /)
		expect(button.querySelector('.base-button__loader')).toHaveAttribute('class', 'base-button__loader')
		expect(button.querySelector('.base-button__content')).toHaveAttribute('class', 'base-button__content')
		expect(button.querySelector('.base-button__label')).toHaveAttribute('class', 'base-button__label')
		expect(button.querySelector('.base-button__slot-left')).toHaveAttribute('class', 'base-button__slot-left')
		expect(button.querySelector('.base-button__slot-right')).toHaveAttribute('class', 'base-button__slot-right')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		render(BaseButton, {
			props: {
				variant: 'soft',
				customClass: 'own-root',
				isLoading: true,
				ui: {
					root: 'u-root',
					content: 'u-content',
					label: 'u-label',
					'slot-left': 'u-left',
					'slot-right': 'u-right',
					loader: 'u-loader',
				},
			},
			slots: SLOTS,
		})
		const button = screen.getByRole('button')

		expect(button).toHaveClass('base-button', 'u-root', 'base-button--soft', 'own-root', 'base-button--loading')
		expect(button.querySelector('.base-button__content')).toHaveClass('u-content')
		expect(button.querySelector('.base-button__label')).toHaveClass('u-label')
		expect(button.querySelector('.base-button__slot-left')).toHaveClass('u-left')
		expect(button.querySelector('.base-button__slot-right')).toHaveClass('u-right')
		expect(button.querySelector('.base-button__loader')).toHaveClass('u-loader')
	})

	it('классы из defaults.BaseButton.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseButton, {
			props: { ui: { label: 'own-label' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseButton: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})
		const button = screen.getByRole('button')

		expect(button).toHaveClass('base-button', 'app-root')
		expect(button.querySelector('.base-button__label')).toHaveAttribute('class', 'base-button__label app-label own-label')
	})
})
