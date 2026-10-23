import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseCardInput from '../ui/BaseCardInput.vue'
import { render, screen } from '@testing-library/vue'
import { caretAfterDigits } from '../model/card/cardText'
import type { CardInputField } from '../types/BaseCardInput.types'
import { field, pressBackspace, typeInto } from './payment/cardInputHelpers'

describe('BaseCardInput unit', () => {
	describe('разметка', () => {
		it('fieldset со скрытой подписью «Банковская карта» и четыре поля с подписями', () => {
			const { container } = render(BaseCardInput)
			const group = screen.getByRole('group', { name: 'Банковская карта' })
			expect(group.tagName).toBe('FIELDSET')
			expect(group).toHaveClass('base-card-input', 'base-card-input--stacked')
			expect(container.querySelector('legend')).toHaveClass('base-card-input__legend--hidden')
			for (const name of ['Номер карты', 'Срок действия', 'Код', 'Имя владельца']) {
				expect(screen.getByRole('textbox', { name })).toBeInTheDocument()
			}
		})

		it('label — видимая подпись группы', () => {
			const { container } = render(BaseCardInput, { props: { label: 'Оплата картой' } })
			expect(screen.getByRole('group', { name: 'Оплата картой' })).toBeInTheDocument()
			expect(container.querySelector('legend')).not.toHaveClass('base-card-input__legend--hidden')
		})

		it('атрибуты полей: autocomplete, inputmode, без name', () => {
			const { container } = render(BaseCardInput)
			const expected: Record<CardInputField, string> = {
				number: 'cc-number',
				expiry: 'cc-exp',
				code: 'cc-csc',
				holder: 'cc-name',
			}
			for (const [name, autocomplete] of Object.entries(expected) as [CardInputField, string][]) {
				const input = field(container, name)
				expect(input).toHaveAttribute('autocomplete', autocomplete)
				expect(input).toHaveAttribute('autocorrect', 'off')
				expect(input).toHaveAttribute('spellcheck', 'false')
				expect(input).not.toHaveAttribute('name')
			}
			expect(field(container, 'number')).toHaveAttribute('inputmode', 'numeric')
			expect(field(container, 'holder')).not.toHaveAttribute('inputmode')
			expect(field(container, 'holder')).toHaveAttribute('autocapitalize', 'characters')
			expect(container.querySelectorAll('input[name]')).toHaveLength(0)
		})

		it('placeholder по умолчанию: 16 нулей группами, ММ/ГГ, 3 нуля, IVAN IVANOV', () => {
			const { container } = render(BaseCardInput)
			expect(field(container, 'number')).toHaveAttribute('placeholder', '0000 0000 0000 0000')
			expect(field(container, 'expiry')).toHaveAttribute('placeholder', 'ММ/ГГ')
			expect(field(container, 'code')).toHaveAttribute('placeholder', '000')
			expect(field(container, 'holder')).toHaveAttribute('placeholder', 'IVAN IVANOV')
		})

		it('hasHolder: false — три поля', () => {
			const { container } = render(BaseCardInput, { props: { hasHolder: false } })
			expect(container.querySelectorAll('input')).toHaveLength(3)
			expect(screen.queryByRole('textbox', { name: 'Имя владельца' })).not.toBeInTheDocument()
		})

		it('раскладка inline, вариант и customClass', () => {
			render(BaseCardInput, { props: { layout: 'inline', variant: 'soft', customClass: { root: 'my-root' } } })
			expect(screen.getByRole('group')).toHaveClass('base-card-input--inline', 'base-card-input--soft', 'my-root')
		})

		it('пишет --size-scale только при масштабе, отличном от 100', () => {
			render(BaseCardInput, { props: { sizeScale: 125 } })
			expect(screen.getByRole('group').style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('isDisabled отключает группу и все поля', () => {
			const { container } = render(BaseCardInput, { props: { isDisabled: true } })
			expect(screen.getByRole('group')).toBeDisabled()
			expect(screen.getByRole('group')).toHaveClass('base-card-input--disabled')
			for (const input of container.querySelectorAll('input')) expect(input).toBeDisabled()
		})

		it('error группы — текст под полями, aria-invalid и описание fieldset', () => {
			render(BaseCardInput, { props: { error: 'Банк отклонил карту' } })
			const group = screen.getByRole('group')
			expect(group).toHaveAttribute('aria-invalid', 'true')
			expect(group).toHaveAccessibleDescription('Банк отклонил карту')
		})

		it('без ошибки — нет aria-invalid и aria-describedby', () => {
			render(BaseCardInput)
			expect(screen.getByRole('group')).not.toHaveAttribute('aria-invalid')
			expect(screen.getByRole('group')).not.toHaveAttribute('aria-describedby')
		})

		it('isRequired — поля обязательны, у группы нет aria-required', () => {
			const { container } = render(BaseCardInput, { props: { isRequired: true } })
			for (const input of container.querySelectorAll('input')) expect(input).toBeRequired()
			expect(screen.getByRole('group')).not.toHaveAttribute('aria-required')
		})
	})

	describe('марка', () => {
		it('Visa — значок svg с именем, подпись кода с названием кода, текст в aria-live', async () => {
			const { container } = render(BaseCardInput)
			await typeInto(field(container, 'number'), '4242')
			const brand = screen.getByRole('img', { name: 'Марка карты: Visa' })
			expect(brand.querySelector('svg')).toBeInTheDocument()
			expect(screen.getByRole('textbox', { name: 'Код CVV2' })).toBeInTheDocument()
			expect(container.querySelector('.base-card-input__live')).toHaveTextContent('Марка карты: Visa')
		})

		it('Мир — название по-русски вместо значка', async () => {
			const { container } = render(BaseCardInput)
			await typeInto(field(container, 'number'), '2200')
			const brand = screen.getByRole('img', { name: 'Марка карты: Мир' })
			expect(brand.querySelector('svg')).not.toBeInTheDocument()
			expect(brand.querySelector('.base-card-input__brand-name')).toHaveTextContent('Мир')
		})

		it('brandIcons — картинка приложения сильнее встроенного значка', async () => {
			const { container } = render(BaseCardInput, { props: { brandIcons: { visa: '/visa.svg' } } })
			await typeInto(field(container, 'number'), '4242')
			const brand = screen.getByRole('img', { name: 'Марка карты: Visa' })
			expect(brand.querySelector('img')).toHaveAttribute('src', '/visa.svg')
			expect(brand.querySelector('svg')).not.toBeInTheDocument()
		})

		it('пока префикс не набран целиком — значка нет', async () => {
			const { container } = render(BaseCardInput)
			await typeInto(field(container, 'number'), '22')
			expect(screen.queryByRole('img')).not.toBeInTheDocument()
			expect(container.querySelector('.base-card-input__live')).toBeEmptyDOMElement()
		})

		it('Amex — placeholder номера 4 6 5 и код из 4 цифр', async () => {
			const { container } = render(BaseCardInput)
			await typeInto(field(container, 'number'), '37')
			expect(field(container, 'number')).toHaveAttribute('placeholder', '0000 000000 00000')
			expect(field(container, 'code')).toHaveAttribute('placeholder', '0000')
			expect(screen.getByRole('textbox', { name: 'Код CID' })).toBeInTheDocument()
		})
	})

	describe('ввод', () => {
		it('номер группируется, лишние цифры отбрасываются, вставка с дефисами', async () => {
			const { container } = render(BaseCardInput)
			const number = field(container, 'number')
			await typeInto(number, '4242-4242 4242 4242')
			expect(number.value).toBe('4242 4242 4242 4242')
			await typeInto(number, '55555555555544449')
			expect(number.value).toBe('5555 5555 5555 4444')
		})

		it('цифра в середине номера — каретка сразу после неё', async () => {
			const { container } = render(BaseCardInput)
			const number = field(container, 'number')
			await typeInto(number, '4242 49242 4242 4242', 7)
			expect(number.value).toBe('4242 4924 2424 2424 2')
			expect(number.selectionStart).toBe(7)
		})

		it('каретка после n-й цифры: 0 цифр — начало, цифр меньше n — после последней', () => {
			expect(caretAfterDigits('4242 42', 0)).toBe(0)
			expect(caretAfterDigits('4242 42', 5)).toBe(6)
			expect(caretAfterDigits('4242 42/', 9)).toBe(7)
			expect(caretAfterDigits('', 1)).toBe(0)
		})

		it('удаление в середине номера — каретка на месте', async () => {
			const { container } = render(BaseCardInput)
			const number = field(container, 'number')
			await typeInto(number, '4242 4242 4242 4242')
			await typeInto(number, '4242 442 4242 4242', 6)
			expect(number.value).toBe('4242 4424 2424 242')
			expect(number.selectionStart).toBe(6)
		})

		it('вставка в середину номера — каретка после вставленных цифр', async () => {
			const { container } = render(BaseCardInput)
			const number = field(container, 'number')
			await typeInto(number, '4242 4242')
			await typeInto(number, '42421111 4242', 8)
			expect(number.value).toBe('4242 1111 4242')
			expect(number.selectionStart).toBe(9)
		})

		it('удаление всего номера — каретка в начале', async () => {
			const { container } = render(BaseCardInput)
			const number = field(container, 'number')
			await typeInto(number, '4242')
			await typeInto(number, '', 0)
			expect(number.value).toBe('')
			expect(number.selectionStart).toBe(0)
		})

		it('срок: «/» после двух цифр, первая 2–9 дополняется нулём, не больше 4 цифр', async () => {
			const { container } = render(BaseCardInput)
			const expiry = field(container, 'expiry')
			await typeInto(expiry, '4')
			expect(expiry.value).toBe('04')
			expect(expiry.selectionStart).toBe(2)
			await typeInto(expiry, '0430')
			expect(expiry.value).toBe('04/30')
			await typeInto(expiry, '12/345')
			expect(expiry.value).toBe('12/34')
			await typeInto(expiry, '1')
			expect(expiry.value).toBe('1')
		})

		it('код: только цифры, без марки до 4, у Visa — 3', async () => {
			const { container } = render(BaseCardInput)
			const code = field(container, 'code')
			await typeInto(code, '1a2345')
			expect(code.value).toBe('1234')
			await typeInto(field(container, 'number'), '4242')
			await typeInto(code, '12345')
			expect(code.value).toBe('123')
		})

		it('имя: верхний регистр, пробелы схлопываются, ведущие убираются, до 26 знаков', async () => {
			const { container } = render(BaseCardInput)
			const holder = field(container, 'holder')
			await typeInto(holder, '  ivan   ivanov')
			expect(holder.value).toBe('IVAN IVANOV')
			await typeInto(holder, 'ivan ivanov', 2)
			expect(holder.selectionStart).toBe(2)
			await typeInto(holder, 'a'.repeat(30))
			expect(holder.value).toBe('A'.repeat(26))
			expect(holder.selectionStart).toBe(26)
		})

		it('поле без положения каретки (selectionStart null) — каретка в конец', async () => {
			const { container } = render(BaseCardInput)
			const number = field(container, 'number')
			Object.defineProperty(number, 'selectionStart', { configurable: true, get: () => null })
			number.value = '42424242'
			number.dispatchEvent(new Event('input', { bubbles: true }))
			await nextTick()
			expect(number.value).toBe('4242 4242')
			expect(number.selectionEnd).toBe(9)
		})

		it('input не из поля (на обёртке) — не обрабатывается', async () => {
			const { container, emitted } = render(BaseCardInput)
			const wrapper = field(container, 'number').closest('.base-input') as HTMLElement
			wrapper.dispatchEvent(new Event('input', { bubbles: true }))
			await nextTick()
			expect(emitted()['update:modelValue']).toBeUndefined()
		})
	})

	describe('переход между полями', () => {
		it('полный номер → срок → код → имя', async () => {
			const { container } = render(BaseCardInput)
			field(container, 'number').focus()
			await typeInto(field(container, 'number'), '4242424242424242')
			expect(field(container, 'expiry')).toHaveFocus()
			await typeInto(field(container, 'expiry'), '1230')
			expect(field(container, 'code')).toHaveFocus()
			await typeInto(field(container, 'code'), '123')
			expect(field(container, 'holder')).toHaveFocus()
			await typeInto(field(container, 'holder'), 'IVAN IVANOV')
			expect(field(container, 'holder')).toHaveFocus()
		})

		it('16 цифр с неверной суммой Луна у Visa (до 19) — без перехода; max длина марки — переход', async () => {
			const { container } = render(BaseCardInput)
			field(container, 'number').focus()
			await typeInto(field(container, 'number'), '4242424242424241')
			expect(field(container, 'number')).toHaveFocus()
			await typeInto(field(container, 'number'), '378282246310005')
			expect(field(container, 'expiry')).toHaveFocus()
		})

		it('19 цифр без марки — переход', async () => {
			const { container } = render(BaseCardInput)
			field(container, 'number').focus()
			await typeInto(field(container, 'number'), '1234567890123456789')
			expect(field(container, 'expiry')).toHaveFocus()
		})

		it('каретка не в конце — без перехода', async () => {
			const { container } = render(BaseCardInput)
			field(container, 'number').focus()
			await typeInto(field(container, 'number'), '4242424242424242', 3)
			expect(field(container, 'number')).toHaveFocus()
		})

		it('код без марки — без перехода; с кода при hasHolder: false — никуда', async () => {
			const { container } = render(BaseCardInput, { props: { hasHolder: false } })
			field(container, 'code').focus()
			await typeInto(field(container, 'code'), '1234')
			expect(field(container, 'code')).toHaveFocus()
			await typeInto(field(container, 'number'), '4242')
			field(container, 'code').focus()
			await typeInto(field(container, 'code'), '123')
			expect(field(container, 'code')).toHaveFocus()
		})

		it('Backspace в начале поля — фокус на предыдущее, каретка в конец', async () => {
			const { container } = render(BaseCardInput)
			await typeInto(field(container, 'number'), '4242')
			const expiry = field(container, 'expiry')
			expiry.focus()
			expiry.setSelectionRange(0, 0)
			expect(pressBackspace(expiry)).toBe(true)
			expect(field(container, 'number')).toHaveFocus()
			expect(field(container, 'number').selectionStart).toBe(4)
		})

		it('Backspace не в начале, другая клавиша и Backspace в номере — без перехода', async () => {
			const { container } = render(BaseCardInput)
			const expiry = field(container, 'expiry')
			await typeInto(expiry, '12')
			expiry.focus()
			expect(pressBackspace(expiry)).toBe(false)
			expiry.setSelectionRange(0, 0)
			expect(pressBackspace(expiry, 'Delete')).toBe(false)
			expiry.setSelectionRange(0, 1)
			expect(pressBackspace(expiry)).toBe(false)
			expect(expiry).toHaveFocus()
			const number = field(container, 'number')
			number.focus()
			number.setSelectionRange(0, 0)
			expect(pressBackspace(number)).toBe(false)
			expect(number).toHaveFocus()
		})
	})
})
