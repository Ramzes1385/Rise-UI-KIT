import '@testing-library/jest-dom/vitest'
import BaseColorModeButton from '../ui/BaseColorModeButton.vue'
import { createColorMode } from '@composables/app/useColorMode'
import type { ColorModeInstance } from '@composables/app/useColorMode'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const REAL_TRANSITION = { global: { stubs: { transition: false } } }

let colorMode: ColorModeInstance

beforeEach(() => {
	colorMode = createColorMode({ target: () => null, storageKey: false, initialMode: 'light' })
})

afterEach(() => {
	colorMode.stop()
})

const icons = () => [...screen.getByRole('button').querySelectorAll('.base-color-mode-button__icon')]

describe('BaseColorModeButton: смена иконки', () => {
	it('солнце и луна сменяются перекрёстно: обе иконки в одной обёртке, уходящая и входящая', async () => {
		render(BaseColorModeButton, { props: { colorMode }, ...REAL_TRANSITION })
		expect(icons()).toHaveLength(1)

		await fireEvent.click(screen.getByRole('button'))

		const [leaving, entering] = icons()
		expect(leaving).toHaveClass('base-color-mode-button__icon-leave-active')
		expect(leaving.querySelector('use')?.getAttribute('href')).toMatch(/#sun$/)
		expect(entering).toHaveClass('base-color-mode-button__icon-enter-active')
		expect(entering.querySelector('use')?.getAttribute('href')).toMatch(/#moon$/)
		expect(leaving.parentElement).toBe(entering.parentElement)
	})

	it('без длительности перехода (reduce, пресет none) остаётся одна новая иконка', async () => {
		render(BaseColorModeButton, { props: { colorMode }, ...REAL_TRANSITION })

		await fireEvent.click(screen.getByRole('button'))

		await waitFor(() => expect(icons()).toHaveLength(1))
		expect(icons()[0].querySelector('use')?.getAttribute('href')).toMatch(/#moon$/)
		expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
	})
})
