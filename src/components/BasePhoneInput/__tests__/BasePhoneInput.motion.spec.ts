import '@testing-library/jest-dom/vitest'
import BasePhoneInput from '../ui/BasePhoneInput.vue'
import { render, waitFor } from '@testing-library/vue'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function renderPhone() {
	const view = render(BasePhoneInput, { props: { country: 'RU' }, global: { stubs: { transition: false } } })
	const trigger = view.container.querySelector('.base-phone-input__trigger')!
	return { ...view, flags: () => [...trigger.querySelectorAll('.base-phone-input__flag')] }
}

describe('BasePhoneInput: смена флага', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('флаг сменяется через Transition base-phone-input-flag: новый на месте сразу, старый уходит', async () => {
		stubReducedMotion(false)
		const { flags, rerender } = renderPhone()
		const before = flags()[0]

		await rerender({ country: 'KZ' })
		expect(flags()).toContain(before)
		expect(flags().at(-1)).not.toBe(before)
		expect(before).toHaveClass('base-phone-input-flag-leave-active')
		await waitFor(() => expect(flags()).toHaveLength(1))
		expect(flags()[0]).not.toBe(before)
	})

	it('первый показ — без анимации появления', () => {
		stubReducedMotion(false)
		const { flags } = renderPhone()

		expect(flags()).toHaveLength(1)
		expect(flags()[0]).not.toHaveClass('base-phone-input-flag-enter-active')
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
	])('%s — сразу конечное состояние: один флаг новой страны', async (_, setup) => {
		setup()
		const { flags, rerender, container } = renderPhone()

		await rerender({ country: 'BY' })
		await waitFor(() => expect(flags()).toHaveLength(1))
		expect(container.querySelector('.base-phone-input__dial')).toHaveTextContent('+375')
	})
})
