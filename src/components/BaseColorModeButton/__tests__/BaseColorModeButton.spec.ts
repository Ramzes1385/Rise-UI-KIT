/**
 * Unit-тесты BaseColorModeButton: имя и состояние кнопки, переключение темы, оформление.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { createColorMode } from '@composables/useColorMode'
import BaseColorModeButton from '../ui/BaseColorModeButton.vue'
import type { ColorModeInstance } from '@composables/useColorMode'

let colorMode: ColorModeInstance
let panel: HTMLElement

beforeEach(() => {
	panel = document.createElement('section')
	colorMode = createColorMode({ target: () => panel, storageKey: false, initialMode: 'light' })
})

afterEach(() => {
	colorMode.stop()
})

describe('BaseColorModeButton unit', () => {
	it('кнопка-переключатель «Тёмная тема»: aria-pressed и иконка по текущей теме', async () => {
		render(BaseColorModeButton, { props: { colorMode } })
		const button = screen.getByRole('button', { name: 'Тёмная тема' })

		expect(button).toHaveAttribute('aria-pressed', 'false')
		expect(button).toHaveAttribute('title', 'Тёмная тема')
		expect(button.querySelector('use')?.getAttribute('href')).toMatch(/#sun$/)

		colorMode.mode.value = 'dark'
		await screen.findByRole('button', { pressed: true })
		expect(button.querySelector('use')?.getAttribute('href')).toMatch(/#moon$/)
	})

	it('клик переключает тему и сообщает новую', async () => {
		const { emitted } = render(BaseColorModeButton, { props: { colorMode } })

		await fireEvent.click(screen.getByRole('button', { name: 'Тёмная тема' }))
		expect(colorMode.mode.value).toBe('dark')
		expect(panel).toHaveAttribute('data-theme', 'dark')

		await fireEvent.click(screen.getByRole('button', { name: 'Тёмная тема' }))
		expect(emitted().change).toEqual([['dark'], ['light']])
	})

	it('своя подпись и отключённое состояние', () => {
		render(BaseColorModeButton, { props: { colorMode, label: 'Dark mode', isDisabled: true } })

		expect(screen.getByRole('button', { name: 'Dark mode' })).toBeDisabled()
	})

	it('вариант ghost по умолчанию, variant, масштаб, цвет и customClass передаются кнопке', async () => {
		const { container, rerender } = render(BaseColorModeButton, { props: { colorMode } })
		const button = container.querySelector('.base-color-mode-button') as HTMLElement
		expect(button).toHaveClass('base-button', 'base-button--ghost')

		await rerender({
			variant: 'soft',
			sizeScale: 125,
			color: { bg: { base: 'var(--rise-primary-soft)' } },
			customClass: { root: 'my-root', icon: 'my-icon' },
		})
		expect(button).toHaveClass('base-button--soft', 'my-root')
		expect(button.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(button.style.getPropertyValue('--custom-bg')).toBe('var(--rise-primary-soft)')
		expect(container.querySelector('.base-icon')).toHaveClass('my-icon')
	})

	it('без colorMode управляет темой приложения (<html>)', async () => {
		vi.resetModules()
		const { default: Button } = await import('../ui/BaseColorModeButton.vue')
		render(Button)

		await fireEvent.click(screen.getByRole('button', { name: 'Тёмная тема' }))
		expect(document.documentElement).toHaveAttribute('data-theme', 'dark')

		document.documentElement.removeAttribute('data-theme')
		localStorage.clear()
	})
})
