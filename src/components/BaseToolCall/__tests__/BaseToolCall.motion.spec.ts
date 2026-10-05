import '@testing-library/jest-dom/vitest'
import BaseToolCall from '../ui/BaseToolCall.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

const PROPS = { name: 'search_docs', status: 'success', args: { q: 'тема' }, result: 'Найдено 2' } as const

const root = (container: Element) => container.querySelector('.base-tool-call') as HTMLElement
const collapse = (container: Element) => container.querySelector('.base-tool-call__collapse') as HTMLElement

async function expectInstantToggle(): Promise<void> {
	const { container } = render(BaseToolCall, { props: PROPS, global: { stubs: { Transition: false } } })
	const trigger = screen.getByRole('button')

	await fireEvent.click(trigger)
	expect(trigger).toHaveAttribute('aria-expanded', 'true')
	expect(root(container)).toHaveClass('base-tool-call--open')
	expect(collapse(container)).toHaveAttribute('class', 'base-tool-call__collapse')
	expect(collapse(container)).not.toHaveAttribute('inert')
	expect(collapse(container)).not.toHaveAttribute('aria-hidden')

	await fireEvent.click(trigger)
	expect(trigger).toHaveAttribute('aria-expanded', 'false')
	expect(root(container)).not.toHaveClass('base-tool-call--open')
	expect(collapse(container)).toHaveAttribute('class', 'base-tool-call__collapse')
	expect(collapse(container)).toHaveAttribute('inert')
	expect(collapse(container)).toHaveAttribute('aria-hidden', 'true')
}

describe('BaseToolCall: раскрытие по высоте', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('подробности — единственный потомок сворачиваемой сетки: отступы и линия внутри обёртки, а не на строке сетки', () => {
		const { container } = render(BaseToolCall, { props: PROPS })
		const body = collapse(container).firstElementChild as HTMLElement

		expect(collapse(container).children).toHaveLength(1)
		expect(body).toHaveAttribute('class', 'base-tool-call__collapse-body')
		expect(body.children).toHaveLength(1)
		expect(body.firstElementChild).toHaveClass('base-tool-call__content')
	})

	it('свёрнутая область остаётся в разметке: aria-controls всегда указывает на неё', async () => {
		const { container } = render(BaseToolCall, { props: PROPS })
		const trigger = screen.getByRole('button')

		expect(document.getElementById(trigger.getAttribute('aria-controls')!)).toBe(collapse(container))
		await fireEvent.click(trigger)
		expect(document.getElementById(trigger.getAttribute('aria-controls')!)).toBe(collapse(container))
		expect(collapse(container)).toHaveTextContent('Найдено 2')
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

	it('при выключенном движении v-model:is-open снаружи раскрывает сразу', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container, rerender } = render(BaseToolCall, { props: PROPS })

		await rerender({ isOpen: true })
		expect(root(container)).toHaveClass('base-tool-call--open')
		expect(collapse(container)).not.toHaveAttribute('inert')
	})
})
