import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

function stubReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

function months(): HTMLElement[] {
	return [...document.querySelectorAll<HTMLElement>('.date-picker-panel__months')]
}

async function openPanel(): Promise<void> {
	render(BaseDatePicker, {
		props: { modelValue: new Date(2026, 8, 10), isMultiMonth: false },
		global: { stubs: { transition: false } },
	})
	await fireEvent.click(screen.getByPlaceholderText('Выберите дату'))
	await nextTick()
}

describe('BaseDatePicker: смена месяца', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it.each([
		['Следующий месяц', 'date-picker-month-next'],
		['Предыдущий месяц', 'date-picker-month-prev'],
		['Следующий год', 'date-picker-month-next'],
		['Предыдущий год', 'date-picker-month-prev'],
	])('«%s» — прежний месяц уходит, новый въезжает с классом %s', async (label, name) => {
		stubReducedMotion(false)
		await openPanel()
		const before = months()[0]

		await fireEvent.click(screen.getByRole('button', { name: label }))
		await nextTick()

		expect(months()).toEqual([before])
		expect(before).toHaveClass(`${name}-leave-active`)
		await waitFor(() => expect(months()).toHaveLength(1))
		await waitFor(() => expect(months()[0]).not.toBe(before))
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
	])('%s — новый месяц сразу, без классов перехода', async (_, setup) => {
		setup()
		await openPanel()
		const before = months()[0]

		await fireEvent.click(screen.getByRole('button', { name: 'Следующий месяц' }))
		await nextTick()

		expect(months()).toHaveLength(1)
		expect(months()[0]).not.toBe(before)
		expect(months()[0].className).not.toMatch(/date-picker-month/)
		expect(document.querySelector('.base-calendar')).toHaveTextContent(/Октябрь/i)
	})
})
