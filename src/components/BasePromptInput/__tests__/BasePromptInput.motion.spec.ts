import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BasePromptInput from '../ui/BasePromptInput.vue'
import { render, screen, waitFor } from '@testing-library/vue'

const REAL_TRANSITION = { global: { stubs: { transition: false } } }

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

const buttons = (container: Element) => [...container.querySelectorAll('.base-prompt-input__button')]

describe('BasePromptInput: смена кнопки отправки и остановки', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('первый показ — без анимации появления', () => {
		stubReducedMotion(false)
		const { container } = render(BasePromptInput, REAL_TRANSITION)

		expect(buttons(container)[0]!.className).not.toMatch(/base-prompt-input-action/)
	})

	it('кнопки сменяются перекрёстно: «Остановить ответ» появляется, «Отправить» уходит и удаляется', async () => {
		stubReducedMotion(false)
		const { container, rerender } = render(BasePromptInput, { props: { modelValue: 'а' }, ...REAL_TRANSITION })
		const send = screen.getByRole('button', { name: 'Отправить' })

		await rerender({ isGenerating: true })

		const stop = screen.getByRole('button', { name: 'Остановить ответ' })
		expect(send).toHaveClass('base-prompt-input-action-leave-active')
		expect(stop).toHaveClass('base-prompt-input-action-enter-active', 'base-prompt-input-action-enter-from')
		expect(buttons(container)).toHaveLength(2)
		await waitFor(() => expect(buttons(container)).toEqual([stop]))
		await waitFor(() => expect(stop.className).not.toMatch(/base-prompt-input-action/))
	})

	it.each([
		['пресет none', () => document.documentElement.setAttribute('data-rise-motion', 'none')],
		['reducedMotion: always', () => document.documentElement.setAttribute('data-rise-reduced-motion', 'always')],
		['системное «уменьшить движение»', () => stubReducedMotion(true)],
	])('%s — сразу конечное состояние: одна новая кнопка без классов перехода', async (_, setup) => {
		stubReducedMotion(false)
		setup()
		const { container, rerender } = render(BasePromptInput, REAL_TRANSITION)
		await nextTick()

		await rerender({ isGenerating: true })

		expect(buttons(container)).toHaveLength(1)
		expect(screen.getByRole('button', { name: 'Остановить ответ' }).className).not.toMatch(/base-prompt-input-action/)

		await rerender({ isGenerating: false })

		expect(buttons(container)).toHaveLength(1)
		expect(screen.getByRole('button', { name: 'Отправить' }).className).not.toMatch(/base-prompt-input-action/)
	})
})
