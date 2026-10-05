import '@testing-library/jest-dom/vitest'
import BaseCardInput from '../ui/BaseCardInput.vue'
import { field, typeInto } from './cardInputHelpers'
import { render, waitFor } from '@testing-library/vue'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function renderCard() {
	const view = render(BaseCardInput, { props: { hasPreview: true }, global: { stubs: { transition: false } } })
	return {
		...view,
		number: field(view.container, 'number'),
		brands: () => [...view.container.querySelectorAll('.base-card-input__brand')],
		faceBrands: () => [...view.container.querySelectorAll('.base-card-input__face-brand')],
	}
}

describe('BaseCardInput: смена марки', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('марка появляется через Transition base-card-input-brand в поле и на превью', async () => {
		stubReducedMotion(false)
		const { number, brands, faceBrands } = renderCard()

		expect(brands()).toHaveLength(0)
		await typeInto(number, '4242')
		expect(brands()[0]).toHaveClass('base-card-input-brand-enter-active')
		expect(faceBrands()[0]).toHaveClass('base-card-input-brand-enter-active')
	})

	it('другая марка: новый значок на месте сразу, старый уходит', async () => {
		stubReducedMotion(false)
		const { number, brands } = renderCard()
		await typeInto(number, '4242')
		await waitFor(() => expect(brands()[0]).not.toHaveClass('base-card-input-brand-enter-active'))
		const before = brands()[0]

		await typeInto(number, '2200')
		expect(brands()).toContain(before)
		expect(before).toHaveClass('base-card-input-brand-leave-active')
		expect(brands().at(-1)).toHaveAttribute('aria-label', expect.stringContaining('Мир'))
		await waitFor(() => expect(brands()).toHaveLength(1))
		expect(brands()[0]).not.toBe(before)
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
	])('%s — сразу конечное состояние: один значок новой марки', async (_, setup) => {
		setup()
		const { number, brands, faceBrands } = renderCard()

		await typeInto(number, '4242')
		await typeInto(number, '2200')
		await waitFor(() => expect(brands()).toHaveLength(1))
		await waitFor(() => expect(faceBrands()).toHaveLength(1))
		expect(brands()[0]).toHaveAttribute('aria-label', expect.stringContaining('Мир'))
	})
})
