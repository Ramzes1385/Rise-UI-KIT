import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BasePhoneInput from '../ui/BasePhoneInput.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const field = () => screen.getByLabelText('Телефон') as HTMLInputElement

const countrySelect = () => screen.getByRole('combobox', { name: 'Код страны' })

function paste(text: string): Event {
	const event = new Event('paste', { bubbles: true, cancelable: true })
	Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } })
	field().dispatchEvent(event)
	return event
}

describe('BasePhoneInput', () => {
	afterEach(() => setLocale('ru'))

	it('код страны с флагом, маска, подсказка и атрибуты поля', () => {
		const { container } = render(BasePhoneInput, { props: { label: 'Телефон', modelValue: '+79161234567' } })

		expect(field()).toHaveValue('(916) 123-45-67')
		expect(field()).toHaveAttribute('type', 'tel')
		expect(field()).toHaveAttribute('autocomplete', 'tel-national')
		expect(field()).toHaveAttribute('inputmode', 'tel')
		expect(countrySelect()).toHaveTextContent('Россия +7')
		expect(countrySelect()).toHaveAttribute('aria-expanded', 'false')
		expect(countrySelect().querySelector('svg.base-phone-input__flag rect')).not.toBeNull()
		expect(container.querySelector('.base-phone-input__dial')).toHaveTextContent('+7')
		expect(container.querySelector('.base-phone-input')).toHaveClass('base-input')
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
	})

	it('клик открывает список стран с флагами; выбранная отмечена', async () => {
		render(BasePhoneInput, { props: { label: 'Телефон', modelValue: '+79161234567' } })

		await fireEvent.click(countrySelect())
		expect(countrySelect()).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByRole('listbox', { name: 'Код страны' })).toBeInTheDocument()
		expect(screen.getAllByRole('option')).toHaveLength(13)
		expect(screen.getByRole('option', { name: 'Россия +7' })).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByRole('option', { name: 'Беларусь +375' })).toHaveAttribute('aria-selected', 'false')
		expect(screen.getByRole('option', { name: 'Беларусь +375' }).querySelector('svg.base-phone-input__flag')).not.toBeNull()
		expect(countrySelect()).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Россия +7' }).id)
	})

	it('ввод цифр — номер в международном формате; пустое поле — пустая строка', async () => {
		const { emitted } = render(BasePhoneInput, { props: { label: 'Телефон' } })

		expect(field()).toHaveAttribute('placeholder', '(000) 000-00-00')
		await fireEvent.update(field(), '916')
		expect(emitted('update:modelValue').at(-1)).toEqual(['+7916'])
		await fireEvent.update(field(), '')
		expect(emitted('update:modelValue').at(-1)).toEqual([''])
	})

	it('смена страны кликом: событие, обрезка номера по новой маске и закрытие списка', async () => {
		const { emitted } = render(BasePhoneInput, { props: { label: 'Телефон', modelValue: '+79161234567' } })

		await fireEvent.click(countrySelect())
		await fireEvent.mouseMove(screen.getByRole('option', { name: 'Киргизия +996' }))
		await fireEvent.click(screen.getByRole('option', { name: 'Киргизия +996' }))
		expect(emitted('update:country')).toEqual([['KG']])
		expect(emitted('update:modelValue').at(-1)).toEqual(['+996916123456'])
		expect(field()).toHaveAttribute('placeholder', '(000) 000-000')
		expect(countrySelect()).toHaveTextContent('Киргизия +996')
		expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
	})

	it('клавиатура: стрелки открывают и двигают, буквы ищут страну, Enter выбирает, Escape закрывает', async () => {
		const { emitted } = render(BasePhoneInput, { props: { label: 'Телефон' } })
		const scroll = vi.mocked(Element.prototype.scrollIntoView)
		scroll.mockClear()

		await fireEvent.keyDown(countrySelect(), { key: 'ArrowDown' })
		expect(countrySelect()).toHaveAttribute('aria-expanded', 'true')
		await fireEvent.keyDown(countrySelect(), { key: 'ArrowDown' })
		const active = () => document.getElementById(countrySelect().getAttribute('aria-activedescendant') as string)
		expect(active()).toHaveTextContent('Казахстан +7')
		expect(scroll).toHaveBeenCalled()
		await fireEvent.keyDown(countrySelect(), { key: 'Б' })
		expect(active()).toHaveTextContent('Беларусь +375')
		await fireEvent.keyDown(countrySelect(), { key: 'Enter' })
		expect(emitted('update:country')).toEqual([['BY']])
		expect(countrySelect()).toHaveAttribute('aria-expanded', 'false')
		await fireEvent.keyDown(countrySelect(), { key: 'Enter' })
		await fireEvent.keyDown(document, { key: 'Escape' })
		expect(countrySelect()).toHaveAttribute('aria-expanded', 'false')
	})

	it('вставка полного номера выбирает страну; короткий номер вставляется как есть', async () => {
		const { emitted } = render(BasePhoneInput, { props: { label: 'Телефон', country: 'RU' } })

		expect(paste('+375 29 123-45-67').defaultPrevented).toBe(true)
		expect(emitted('update:country')).toEqual([['BY']])
		expect(emitted('update:modelValue').at(-1)).toEqual(['+375291234567'])
		expect(paste('+375 33 000-00-00').defaultPrevented).toBe(true)
		expect(emitted('update:country')).toHaveLength(1)
		expect(paste('33 1').defaultPrevented).toBe(false)
	})

	it('v-model и страна снаружи, свои страны, is-disabled, язык и оформление', async () => {
		const countries = [{ code: 'KZ', dialCode: '7', mask: '### ### ## ##' }]
		const { rerender, container } = render(BasePhoneInput, {
			props: {
				label: 'Телефон',
				countries,
				isDisabled: true,
				variant: 'soft',
				sizeScale: 125,
				customClass: { root: 'r', field: 'f', country: 'c' },
			},
		})

		expect(field()).toBeDisabled()
		expect(countrySelect()).toHaveAttribute('aria-disabled', 'true')
		expect(countrySelect()).not.toHaveAttribute('tabindex')
		await fireEvent.click(countrySelect())
		await fireEvent.keyDown(countrySelect(), { key: 'ArrowDown' })
		expect(countrySelect()).toHaveAttribute('aria-expanded', 'false')
		expect(countrySelect()).toHaveTextContent('Казахстан +7')
		expect(container.querySelector('.base-phone-input__country')).toHaveClass('c')
		await rerender({ modelValue: '+77012345678' })
		expect(field()).toHaveValue('701 234 56 78')
		await rerender({ countries: undefined, country: 'BY', modelValue: '+375291234567' })
		expect(countrySelect()).toHaveTextContent('Беларусь +375')
		expect(field()).toHaveValue('(29) 123-45-67')
		await rerender({ country: undefined })
		expect(countrySelect()).toHaveTextContent('Беларусь +375')
		expect(container.querySelector('.base-phone-input')).toHaveClass('base-input--soft', 'r')
		expect(field()).toHaveClass('f')
		setLocale('en')
		await rerender({ isDisabled: false })
		await fireEvent.click(screen.getByRole('combobox', { name: 'Country code' }))
		expect(screen.getByRole('option', { name: 'Belarus +375' })).toBeInTheDocument()
	})

	it('страна без своего флага — плашка с кодом', async () => {
		const { container } = render(BasePhoneInput, {
			props: { label: 'Телефон', countries: [{ code: 'de', dialCode: '49', mask: '#### #######' }] },
		})

		expect(container.querySelector('.base-phone-input__flag-code')).toHaveTextContent('DE')
		expect(container.querySelector('.base-phone-input__flag rect')?.namespaceURI).toBe('http://www.w3.org/2000/svg')
	})
})
