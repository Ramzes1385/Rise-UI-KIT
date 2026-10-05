import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseAutocomplete from '../ui/BaseAutocomplete.vue'
import type { AutocompleteOption } from '../types/BaseAutocomplete.types'

const CITIES: AutocompleteOption[] = [
	{ value: 'msk', label: 'Москва' },
	{ value: 'kzn', label: 'Казань' },
]

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function states(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('.base-autocomplete__empty')]
}

function options(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('.base-autocomplete__option')]
}

async function openLoading() {
	const view = render(BaseAutocomplete, {
		props: { options: [], isRemote: true, isLoading: true, ariaLabel: 'Город' },
		global: { stubs: { transition: false, 'transition-group': false } },
	})
	await userEvent.setup().click(screen.getByRole('combobox', { name: 'Город' }))
	return view
}

describe('BaseAutocomplete: смена состояний списка', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('загрузка → результаты → пусто: прежнее состояние уходит сразу, новое проявляется (enter-fade)', async () => {
		stubReducedMotion(false)
		const { rerender } = await openLoading()
		expect(states()).toHaveLength(1)
		expect(states()[0]).toHaveTextContent('Загрузка')

		await rerender({ options: CITIES, isLoading: false })
		await nextTick()
		expect(states()).toHaveLength(0)
		expect(options()).toHaveLength(2)
		for (const option of options()) expect(option).toHaveClass('base-autocomplete-option-enter-active')

		await rerender({ options: [] })
		await nextTick()
		expect(options()).toHaveLength(0)
		expect(states()).toHaveLength(1)
		expect(states()[0]).toHaveTextContent('Ничего не найдено')
		expect(states()[0]).toHaveClass('base-autocomplete-state-enter-active')

		await rerender({ isLoading: true })
		await nextTick()
		expect(states()).toHaveLength(1)
		expect(states()[0]).toHaveTextContent('Загрузка')
		expect(states()[0]).toHaveClass('base-autocomplete-state-enter-active')
	})

	it.each([
		['prefers-reduced-motion: reduce', () => stubReducedMotion(true)],
		[
			'пресет none',
			() => {
				stubReducedMotion(false)
				document.documentElement.setAttribute('data-rise-motion', 'none')
			},
		],
	])('%s — сразу конечное состояние, без классов перехода', async (_, setup) => {
		setup()
		const { rerender } = await openLoading()

		await rerender({ options: CITIES, isLoading: false })
		expect(states()).toHaveLength(0)
		expect(options()).toHaveLength(2)
		for (const option of options()) expect(option).not.toHaveClass('base-autocomplete-option-enter-active')

		await rerender({ options: [] })
		expect(options()).toHaveLength(0)
		expect(states()[0]).toHaveTextContent('Ничего не найдено')
		expect(states()[0]).not.toHaveClass('base-autocomplete-state-enter-active')
	})
})
