import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BaseMoneyInput from '../ui/BaseMoneyInput.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const field = () => screen.getByLabelText('Сумма') as HTMLInputElement

async function typeAt(text: string, caret = text.length): Promise<void> {
	field().value = text
	field().setSelectionRange(caret, caret)
	await fireEvent.input(field())
}

describe('BaseMoneyInput', () => {
	afterEach(() => setLocale('ru'))

	it('сумма с разрядами и знаком рубля после числа; атрибуты поля', () => {
		const { container } = render(BaseMoneyInput, { props: { label: 'Сумма', modelValue: 1234.5 } })

		expect(field().value).toMatch(/^1\s234,50$/)
		expect(field()).toHaveAttribute('inputmode', 'decimal')
		expect(container.querySelector('.base-input__postfix')).toHaveTextContent('₽')
		expect(container.querySelector('.base-input__prefix')).toBeNull()
	})

	it('ввод: разряды сразу, курсор на месте, число в v-model', async () => {
		const { emitted } = render(BaseMoneyInput, { props: { label: 'Сумма' } })

		await fireEvent.focus(field())
		expect(field()).toHaveValue('')
		await typeAt('1234567')
		expect(field().value).toMatch(/^1\s234\s567$/)
		expect(field().selectionStart).toBe(9)
		expect(emitted('update:modelValue').at(-1)).toEqual([1234567])
		await typeAt('12a34', 3)
		expect(field().value).toMatch(/^1\s234$/)
		expect(field().selectionStart).toBe(3)
		await typeAt('')
		expect(emitted('update:modelValue').at(-1)).toEqual([null])
	})

	it('уход из поля: округление, min и max; пустое поле — без события', async () => {
		const { emitted, rerender } = render(BaseMoneyInput, { props: { label: 'Сумма', max: 1000 } })

		await fireEvent.focus(field())
		await fireEvent.blur(field())
		expect(emitted('update:modelValue')).toBeUndefined()
		await fireEvent.focus(field())
		await typeAt('5000')
		await fireEvent.blur(field())
		expect(emitted('update:modelValue').at(-1)).toEqual([1000])
		await rerender({ modelValue: 12.5 })
		await fireEvent.focus(field())
		await typeAt('12,5')
		await fireEvent.blur(field())
		expect(emitted('update:modelValue').at(-1)).toEqual([12.5])
		expect(field().value).toBe('12,50')
	})

	it('доллар — знак перед числом, отрицательные при min < 0; is-disabled, язык и оформление', async () => {
		setLocale('en')
		const { container, emitted } = render(BaseMoneyInput, {
			props: {
				label: 'Сумма',
				currency: 'USD',
				min: -500,
				modelValue: -1234,
				variant: 'soft',
				customClass: { root: 'r', field: 'f' },
			},
		})

		expect(field()).toHaveValue('-1,234')
		expect(container.querySelector('.base-input__prefix')).toHaveTextContent('$')
		await fireEvent.focus(field())
		await typeAt('-1,234')
		await fireEvent.blur(field())
		expect(emitted('update:modelValue').at(-1)).toEqual([-500])
		expect(container.querySelector('.base-money-input')).toHaveClass('base-input--soft', 'r')
		expect(field()).toHaveClass('f')
	})

	it('is-disabled', () => {
		render(BaseMoneyInput, { props: { label: 'Сумма', isDisabled: true, modelValue: 5 } })

		expect(field()).toBeDisabled()
		expect(field()).toHaveValue('5')
	})
})
