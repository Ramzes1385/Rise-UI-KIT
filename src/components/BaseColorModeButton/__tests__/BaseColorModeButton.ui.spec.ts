import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'
import BaseColorModeButton from '../ui/BaseColorModeButton.vue'
import { createColorMode } from '@composables/app/useColorMode'
import type { ColorModeInstance } from '@composables/app/useColorMode'

let colorMode: ColorModeInstance

beforeEach(() => {
	colorMode = createColorMode({ target: () => null, storageKey: false, initialMode: 'light' })
})

afterEach(() => {
	colorMode.stop()
})

describe('BaseColorModeButton: проп ui', () => {
	it('без ui — только классы кита на всех частях', () => {
		render(BaseColorModeButton, { props: { colorMode } })
		const button = screen.getByRole('button', { name: 'Тёмная тема' })

		expect(button).toHaveClass('base-color-mode-button', 'base-button')
		expect(button.querySelector('.base-color-mode-button__icons')).toHaveAttribute('class', 'base-color-mode-button__icons')
		expect(button.querySelector('.base-color-mode-button__icon')).toHaveClass('base-icon')
	})

	it('классы частей добавляются к классам кита, вариант и customClass сохраняются', () => {
		render(BaseColorModeButton, {
			props: {
				colorMode,
				variant: 'outline',
				customClass: { root: 'own-root', icon: 'own-icon' },
				ui: { root: 'u-root', icons: 'u-icons', icon: 'u-icon' },
			},
		})
		const button = screen.getByRole('button', { name: 'Тёмная тема' })

		expect(button).toHaveClass('base-color-mode-button', 'u-root', 'base-button--outline', 'own-root')
		expect(button.querySelector('.base-color-mode-button__icons')).toHaveClass('u-icons')
		expect(button.querySelector('.base-color-mode-button__icon')).toHaveClass('u-icon', 'own-icon')
	})

	it('классы из defaults.BaseColorModeButton.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseColorModeButton, {
			props: { colorMode, ui: { icons: 'own-icons' } },
			global: {
				plugins: [createUiKitPlugin({ defaults: { BaseColorModeButton: { ui: { root: 'app-root', icons: 'app-icons' } } } })],
			},
		})
		const button = screen.getByRole('button', { name: 'Тёмная тема' })

		expect(button).toHaveClass('base-color-mode-button', 'app-root')
		expect(button.querySelector('.base-color-mode-button__icons')).toHaveAttribute(
			'class',
			'base-color-mode-button__icons app-icons own-icons',
		)
	})
})
