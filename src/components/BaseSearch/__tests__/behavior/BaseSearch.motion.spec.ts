import '@testing-library/jest-dom/vitest'
import BaseSearch from '../ui/BaseSearch.vue'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'

vi.mock('@composables/overlay/useClickOutside', () => ({ useClickOutside: vi.fn() }))
vi.mock('@composables/overlay/useEscapeKey', () => ({ useEscapeKey: vi.fn() }))
vi.mock('@composables/overlay/useScrollLock', () => ({ useScrollLock: () => ({ lock: vi.fn(), unlock: vi.fn() }) }))

const RESULTS = [{ id: 1, title: 'Закат в горах' }]

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function area(preset?: string): HTMLElement {
	const element = document.body.appendChild(document.createElement('div'))
	if (preset) element.setAttribute('data-rise-motion', preset)
	return element
}

async function renderLoading(preset?: string) {
	const view = render(BaseSearch, {
		props: { modelValue: 'закат', results: [], isRemote: true, isLoading: true },
		container: area(preset),
		global: { stubs: { transition: false } },
	})
	await userEvent.setup().click(screen.getByRole('combobox'))
	return view
}

const listbox = () => document.querySelector('.base-search__listbox')

const REDUCED = [
	['prefers-reduced-motion: reduce', () => stubReducedMotion(true)],
	[
		'пресет none',
		() => {
			stubReducedMotion(false)
			document.documentElement.setAttribute('data-rise-motion', 'none')
		},
	],
] as const

describe('BaseSearch: движение', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
		document.body.innerHTML = ''
	})

	describe('смена «загрузка → результаты → пусто»', () => {
		it('новое состояние проявляется через Transition base-search-state, старое уходит сразу', async () => {
			stubReducedMotion(false)
			const { rerender } = await renderLoading()

			await rerender({ isLoading: false, results: RESULTS })
			expect(document.querySelector('.base-search__status')).not.toBeInTheDocument()
			expect(listbox()).toHaveClass('base-search-state-enter-active')
			await waitFor(() => expect(listbox()).not.toHaveClass('base-search-state-enter-active'))

			await rerender({ results: [] })
			expect(listbox()).not.toBeInTheDocument()
			expect(document.querySelector('.base-search__empty')).toHaveClass('base-search-state-enter-active')
		})

		it.each(REDUCED)('%s — сразу конечное состояние, без классов перехода', async (_, setup) => {
			setup()
			const { rerender } = await renderLoading()

			await rerender({ isLoading: false, results: RESULTS })
			expect(listbox()).toBeInTheDocument()
			expect(listbox()!.className).not.toMatch(/enter/)
			await rerender({ results: [] })
			expect(document.querySelector('.base-search__empty')!.className).not.toMatch(/enter/)
		})

		it('пресет области поля переходит на панель в слое страницы; без пресета у предка — атрибута нет', async () => {
			stubReducedMotion(false)
			const { rerender } = await renderLoading('subtle')

			expect(document.querySelector('.base-search__status')).toHaveAttribute('data-rise-motion', 'subtle')
			await rerender({ isLoading: false, results: RESULTS })
			expect(listbox()).toHaveAttribute('data-rise-motion', 'subtle')
			document.body.innerHTML = ''

			await renderLoading()
			expect(document.querySelector('.base-search__status')).not.toHaveAttribute('data-rise-motion')
		})
	})

	describe('окно и боковая панель', () => {
		const TRANSITION_NAME = { modal: 'base-modal', sidebar: 'base-slideover' } as const

		async function openOverlay(mode: 'modal' | 'sidebar', preset?: string) {
			const view = render(BaseSearch, {
				props: { mode, modelValue: '', results: RESULTS },
				container: area(preset),
				global: { stubs: { transition: false } },
			})
			await userEvent.setup().click(screen.getByRole('textbox'))
			return { ...view, overlay: () => document.querySelector(`.base-search__${mode}-overlay`) }
		}

		it.each(['modal', 'sidebar'] as const)('%s появляется и уходит через Transition, область результатов проявляется', async mode => {
			stubReducedMotion(false)
			const { overlay, rerender } = await openOverlay(mode)

			expect(overlay()).toBeInTheDocument()
			await waitFor(() => expect(overlay()).not.toHaveClass(`${TRANSITION_NAME[mode]}-enter-active`))
			await rerender({ modelValue: 'закат' })
			expect(document.querySelector(`.base-search__${mode}-results`)).toHaveClass('base-search-results-enter-active')

			await userEvent.setup().click(screen.getByRole('button', { name: 'Закрыть' }))
			expect(overlay()).toHaveClass(`${TRANSITION_NAME[mode]}-leave-active`)
			await waitFor(() => expect(overlay()).not.toBeInTheDocument())
		})

		it('окно получает пресет области поля', async () => {
			stubReducedMotion(false)
			const { overlay } = await openOverlay('modal', 'expressive')

			expect(overlay()).toHaveAttribute('data-rise-motion', 'expressive')
		})

		it.each(REDUCED)('%s — окно открывается и закрывается сразу', async (_, setup) => {
			setup()
			const { overlay, rerender } = await openOverlay('modal')

			expect(overlay()).toBeInTheDocument()
			await rerender({ modelValue: 'закат' })
			expect(document.querySelector('.base-search__modal-results')!.className).not.toMatch(/enter/)
			await userEvent.setup().click(screen.getByRole('button', { name: 'Закрыть' }))
			await waitFor(() => expect(overlay()).not.toBeInTheDocument())
		})
	})
})
