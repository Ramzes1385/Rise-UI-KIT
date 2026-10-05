import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { DATE_PICKER_INPUT_PARTS, DATE_PICKER_PARTS } from '../types/BaseDatePicker.types'

const ui = Object.fromEntries([['root', 'u-root'], ...DATE_PICKER_PARTS.map(part => [part, `u-${part}`])])

const INNER = Object.fromEntries(Object.entries(DATE_PICKER_INPUT_PARTS).map(([inner, part]) => [part, `.base-input__${inner}`]))

async function openPanel(): Promise<void> {
	await fireEvent.click(screen.getByPlaceholderText('Выберите дату'))
}

describe('BaseDatePicker: проп ui', () => {
	it('свои части получают БЭМ-класс дейтпикера и классы ui, части BaseInput — только классы ui', async () => {
		const { container } = render(BaseDatePicker, {
			props: { modelValue: new Date(2026, 8, 10), label: 'Дата', isRequired: true, error: 'Ошибка', isClearable: true, ui },
		})
		await openPanel()

		expect(container.querySelector('.base-date-picker')).toHaveClass('u-root')
		for (const part of DATE_PICKER_PARTS) {
			const element = document.querySelector(INNER[part] ?? `.base-date-picker__${part}`)
			expect(element, part).toHaveClass(`u-${part}`)
		}
		expect(document.querySelector('.base-date-picker__field')).toHaveClass('date-picker-field')
		expect(document.querySelector('.base-date-picker__panel')).toHaveClass('date-picker-panel')
		expect(document.querySelectorAll('.base-date-picker__nav-btn.date-picker-panel__nav-btn')).toHaveLength(4)
		expect(document.querySelectorAll('.base-date-picker__nav-group')).toHaveLength(2)
		expect(document.querySelector('.base-input__field')!.className).not.toMatch(/base-date-picker__/)
	})

	it('режим range: календари месяцев получают класс calendar', async () => {
		render(BaseDatePicker, { props: { selectionMode: 'range', modelValue: new Date(2026, 8, 10), ui: { calendar: 'u-calendar' } } })
		await openPanel()

		const calendars = document.querySelectorAll('.date-picker-panel__calendar')
		expect(calendars.length).toBeGreaterThan(0)
		for (const calendar of calendars) expect(calendar).toHaveClass('base-date-picker__calendar', 'u-calendar')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', async () => {
		const { container } = render(BaseDatePicker, {
			props: { modelValue: new Date(2026, 8, 10), ui: { header: 'own', input: 'own-input' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseDatePicker: { ui: { header: 'app', wrapper: 'app-wrapper' } } } })] },
		})
		await openPanel()

		expect(container.querySelector('.base-date-picker')).toHaveAttribute('class', 'base-date-picker')
		expect(container.querySelector('.base-input__wrapper')).toHaveClass('app-wrapper')
		expect(container.querySelector('.base-input__field')).toHaveClass('own-input')
		expect(document.querySelector('.date-picker-panel__header')).toHaveAttribute(
			'class',
			'date-picker-panel__header base-date-picker__header app own',
		)
	})
})
