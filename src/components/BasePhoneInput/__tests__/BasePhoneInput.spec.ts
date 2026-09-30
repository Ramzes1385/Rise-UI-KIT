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

	it('код страны, маска, подсказка и атрибуты поля', () => {
		const { container } = render(BasePhoneInput, { props: { label: 'Телефон', modelValue: '+79161234567' } })

		expect(field()).toHaveValue('(916) 123-45-67')
		expect(field()).toHaveAttribute('type', 'tel')
		expect(field()).toHaveAttribute('autocomplete', 'tel-national')
		expect(field()).toHaveAttribute('inputmode', 'tel')
		expect(countrySelect()).toHaveValue('RU')
		expect(screen.getByRole('option', { name: 'Россия +7' })).toBeInTheDocument()
		expect(screen.getByRole('option', { name: 'Беларусь +375' })).toBeInTheDocument()
		expect(container.querySelector('.base-phone-input__dial')).toHaveTextContent('+7')
		expect(container.querySelector('.base-phone-input')).toHaveClass('base-input')
	})

	it('ввод цифр — номер в международном формате; пустое поле — пустая строка', async () => {
		const { emitted } = render(BasePhoneInput, { props: { label: 'Телефон' } })

		expect(field()).toHaveAttribute('placeholder', '(000) 000-00-00')
		await fireEvent.update(field(), '916')
		expect(emitted('update:modelValue').at(-1)).toEqual(['+7916'])
		await fireEvent.update(field(), '')
		expect(emitted('update:modelValue').at(-1)).toEqual([''])
	})

	it('смена страны: событие и обрезка номера по новой маске', async () => {
		const { emitted } = render(BasePhoneInput, { props: { label: 'Телефон', modelValue: '+79161234567' } })

		await fireEvent.update(countrySelect(), 'KG')
		expect(emitted('update:country')).toEqual([['KG']])
		expect(emitted('update:modelValue').at(-1)).toEqual(['+996916123456'])
		expect(field()).toHaveAttribute('placeholder', '(000) 000-000')
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
				customClass: { root: 'r', field: 'f' },
			},
		})

		expect(field()).toBeDisabled()
		expect(countrySelect()).toBeDisabled()
		expect(countrySelect()).toHaveValue('KZ')
		await rerender({ modelValue: '+77012345678' })
		expect(field()).toHaveValue('701 234 56 78')
		await rerender({ countries: undefined, country: 'BY', modelValue: '+375291234567' })
		expect(countrySelect()).toHaveValue('BY')
		expect(field()).toHaveValue('(29) 123-45-67')
		await rerender({ country: undefined })
		expect(countrySelect()).toHaveValue('BY')
		expect(container.querySelector('.base-phone-input')).toHaveClass('base-input--soft', 'r')
		expect(field()).toHaveClass('f')
		setLocale('en')
		await rerender({ isDisabled: false })
		expect(screen.getByRole('combobox', { name: 'Country code' })).toBeInTheDocument()
		expect(screen.getByRole('option', { name: 'Belarus +375' })).toBeInTheDocument()
	})
})
