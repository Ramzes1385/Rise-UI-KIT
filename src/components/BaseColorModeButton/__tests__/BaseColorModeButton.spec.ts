import '@testing-library/jest-dom/vitest'
import BaseColorModeButton from '../ui/BaseColorModeButton.vue'
import { createColorMode } from '@composables/app/useColorMode'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { ColorModeInstance } from '@composables/app/useColorMode'

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
		expect(button).not.toHaveAttribute('title')
		expect(button.querySelector('use')?.getAttribute('href')).toMatch(/#sun$/)

		colorMode.mode.value = 'dark'
		await screen.findByRole('button', { pressed: true })
		expect(button.querySelector('use')?.getAttribute('href')).toMatch(/#moon$/)
	})

	it('корень — кнопка: class и атрибуты приложения на ней, подсказка вместо title', async () => {
		const { container } = render(BaseColorModeButton, { props: { colorMode }, attrs: { class: 'app-class', 'data-test': 'x' } })
		const button = screen.getByRole('button', { name: 'Тёмная тема' })

		expect(container.firstElementChild).toBe(button)
		expect(button).toHaveClass('app-class', 'base-color-mode-button')
		expect(button).toHaveAttribute('data-test', 'x')
		await fireEvent.mouseEnter(button)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Тёмная тема')
		expect(button).not.toHaveAttribute('aria-describedby')
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

	it('отключённая кнопка показывает подсказку через обёртку, включённая — без обёртки', async () => {
		const { container, rerender } = render(BaseColorModeButton, { props: { colorMode, isDisabled: true } })
		const button = screen.getByRole('button', { name: 'Тёмная тема' })
		const wrapper = button.closest('.base-tooltip') as HTMLElement

		expect(wrapper).not.toBeNull()
		await fireEvent.mouseEnter(wrapper)
		expect(await screen.findByRole('tooltip')).toHaveTextContent('Тёмная тема')

		await rerender({ isDisabled: false })
		expect(container.querySelector('.base-tooltip')).toBeNull()
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
