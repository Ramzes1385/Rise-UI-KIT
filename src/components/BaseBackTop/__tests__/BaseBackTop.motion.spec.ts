import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseBackTop from '../ui/BaseBackTop.vue'
import { render, screen, waitFor } from '@testing-library/vue'

const REAL_TRANSITION = { global: { stubs: { transition: false } } }

function scrollWindow(y: number): void {
	Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
	window.dispatchEvent(new Event('scroll'))
}

function stubReducedMotion(): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

async function expectInstantShowAndHide(): Promise<void> {
	render(BaseBackTop, REAL_TRANSITION)
	scrollWindow(1000)
	await nextTick()

	const button = screen.getByRole('button', { name: 'Наверх' })
	expect(button.className).not.toMatch(/base-back-top-enter/)

	scrollWindow(0)
	await nextTick()
	expect(screen.queryByRole('button', { name: 'Наверх' })).not.toBeInTheDocument()
}

describe('BaseBackTop: появление и уход', () => {
	beforeEach(() => {
		window.scrollTo = vi.fn()
	})

	afterEach(() => {
		scrollWindow(0)
		document.documentElement.removeAttribute('data-rise-motion')
		document.documentElement.removeAttribute('data-rise-reduced-motion')
		vi.unstubAllGlobals()
	})

	it('кнопка появляется и уходит через Transition base-back-top', async () => {
		render(BaseBackTop, REAL_TRANSITION)
		scrollWindow(1000)
		await nextTick()

		const button = screen.getByRole('button', { name: 'Наверх' })
		expect(button).toHaveClass('base-back-top-enter-from', 'base-back-top-enter-active')

		scrollWindow(0)
		await nextTick()
		expect(button).toHaveClass('base-back-top-leave-active')
		await waitFor(() => expect(screen.queryByRole('button', { name: 'Наверх' })).not.toBeInTheDocument())
	})

	it('пресет none — кнопка появляется и уходит сразу, без классов перехода', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		await expectInstantShowAndHide()
	})

	it('reducedMotion: always — сразу конечное состояние', async () => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
		await expectInstantShowAndHide()
	})

	it('системное «уменьшить движение» — сразу конечное состояние', async () => {
		stubReducedMotion()
		await expectInstantShowAndHide()
	})

	it('пресет на прокручиваемом контейнере действует на кнопку контейнера', async () => {
		const list = document.createElement('div')
		list.setAttribute('data-rise-motion', 'none')
		list.scrollTop = 500
		document.body.append(list)
		render(BaseBackTop, { props: { target: list }, ...REAL_TRANSITION })
		await nextTick()

		expect(screen.getByRole('button', { name: 'Наверх' }).className).not.toMatch(/base-back-top-enter/)
		list.remove()
	})

	it('порог visibilityHeight реактивен: смена показывает и прячет кнопку без прокрутки', async () => {
		const { rerender } = render(BaseBackTop, { props: { visibilityHeight: 100 } })
		expect(screen.queryByRole('button', { name: 'Наверх' })).not.toBeInTheDocument()

		await rerender({ visibilityHeight: -1 })
		expect(screen.getByRole('button', { name: 'Наверх' })).toBeInTheDocument()

		await rerender({ visibilityHeight: Infinity })
		expect(screen.queryByRole('button', { name: 'Наверх' })).not.toBeInTheDocument()
	})
})
