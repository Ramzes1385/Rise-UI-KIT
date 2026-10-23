import '@testing-library/jest-dom/vitest'
import BaseReasoning from '../ui/BaseReasoning.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

const root = (container: Element) => container.querySelector('.base-reasoning') as HTMLElement
const collapse = (container: Element) => container.querySelector('.base-reasoning__collapse') as HTMLElement

async function expectInstantToggle(): Promise<void> {
	const { container } = render(BaseReasoning, { props: { content: 'Ход мысли' }, global: { stubs: { Transition: false } } })
	const trigger = screen.getByRole('button')

	await fireEvent.click(trigger)
	expect(trigger).toHaveAttribute('aria-expanded', 'true')
	expect(root(container)).toHaveClass('base-reasoning--open')
	expect(collapse(container)).toHaveAttribute('class', 'base-reasoning__collapse')
	expect(collapse(container)).not.toHaveAttribute('inert')
	expect(collapse(container)).not.toHaveAttribute('aria-hidden')

	await fireEvent.click(trigger)
	expect(trigger).toHaveAttribute('aria-expanded', 'false')
	expect(root(container)).not.toHaveClass('base-reasoning--open')
	expect(collapse(container)).toHaveAttribute('class', 'base-reasoning__collapse')
	expect(collapse(container)).toHaveAttribute('inert')
	expect(collapse(container)).toHaveAttribute('aria-hidden', 'true')
}

describe('BaseReasoning: раскрытие по высоте', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('свёрнутая область остаётся в разметке: aria-controls всегда указывает на неё, содержимое не удаляется', async () => {
		const { container } = render(BaseReasoning, { props: { content: 'Ход мысли' } })
		const trigger = screen.getByRole('button')

		expect(document.getElementById(trigger.getAttribute('aria-controls')!)).toBe(collapse(container))
		expect(collapse(container)).toHaveTextContent('Ход мысли')
		await fireEvent.click(trigger)
		expect(document.getElementById(trigger.getAttribute('aria-controls')!)).toBe(collapse(container))
		await fireEvent.click(trigger)
		expect(collapse(container)).toHaveTextContent('Ход мысли')
	})

	it('обычное движение — состояние меняется классом модификатора, без вставки и удаления элементов', async () => {
		stubReducedMotion(false)
		await expectInstantToggle()
	})

	it('prefers-reduced-motion: reduce — сразу конечное состояние', async () => {
		stubReducedMotion(true)
		await expectInstantToggle()
	})

	it('пресет none — сразу конечное состояние', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		await expectInstantToggle()
	})

	it("reducedMotion: 'always' — сразу конечное состояние", async () => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
		await expectInstantToggle()
	})

	it('поток с has-auto-toggle при выключенном движении раскрывает и сворачивает блок сразу', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container, rerender } = render(BaseReasoning, { props: { content: 'Шаг', isStreaming: true } })

		expect(root(container)).toHaveClass('base-reasoning--open', 'base-reasoning--streaming')
		await rerender({ isStreaming: false })
		expect(root(container)).not.toHaveClass('base-reasoning--open')
		expect(root(container)).not.toHaveClass('base-reasoning--streaming')
	})
})
