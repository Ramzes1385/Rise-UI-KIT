import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import BaseRequisiteInput from '../ui/BaseRequisiteInput.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseRequisiteInput', () => {
	afterEach(() => setLocale('ru'))

	it('подпись по виду реквизита, маска и атрибуты поля', () => {
		render(BaseRequisiteInput, { props: { kind: 'snils', modelValue: '11223344595' } })
		const field = screen.getByLabelText('СНИЛС')

		expect(field).toHaveValue('112-233-445 95')
		expect(field).toHaveAttribute('inputmode', 'numeric')
		expect(field).toHaveAttribute('autocomplete', 'off')
		expect(field).not.toHaveAttribute('aria-invalid')
	})

	it('ввод: только цифры, событие validate; ошибка — когда введены все знаки или после ухода из поля', async () => {
		const { emitted } = render(BaseRequisiteInput, { props: { kind: 'inn' } })
		const field = screen.getByLabelText('ИНН')

		await fireEvent.focus(field)
		await fireEvent.update(field, '77070')
		expect(emitted('update:modelValue').at(-1)).toEqual(['77070'])
		expect(emitted('validate').at(-1)).toEqual([null])
		await fireEvent.blur(field)
		expect(field).toHaveAccessibleDescription('Нужно цифр: 10 или 12')
		await fireEvent.focus(field)
		await fireEvent.update(field, '7707083894')
		expect(emitted('validate').at(-1)).toEqual([false])
		expect(field).not.toHaveAttribute('aria-invalid')
		await fireEvent.blur(field)
		expect(field).toHaveAccessibleDescription('Неверное контрольное число')
		await fireEvent.focus(field)
		await fireEvent.update(field, '500100732258')
		expect(field).toHaveAccessibleDescription('Неверное контрольное число')
		await fireEvent.update(field, '500100732259')
		expect(emitted('validate').at(-1)).toEqual([true])
		expect(field).not.toHaveAttribute('aria-invalid')
		await fireEvent.update(field, '')
		expect(emitted('validate').at(-1)).toEqual([null])
	})

	it('КПП с буквами, БИК, счёт и своя ошибка', async () => {
		const { rerender, emitted } = render(BaseRequisiteInput, { props: { kind: 'kpp' } })

		expect(screen.getByLabelText('КПП')).toHaveAttribute('inputmode', 'text')
		await fireEvent.update(screen.getByLabelText('КПП'), '7736ab00')
		expect(emitted('update:modelValue').at(-1)).toEqual(['7736AB00'])
		await rerender({ kind: 'bik', modelValue: '144525225' })
		expect(screen.getByLabelText('БИК')).toHaveAccessibleDescription('Неверный формат')
		await rerender({ kind: 'correspondentAccount', bik: '044525225', modelValue: '30101810400000000226' })
		expect(screen.getByLabelText('Корреспондентский счёт')).toHaveAccessibleDescription('Счёт не подходит к БИК')
		await rerender({ error: 'Проверьте реквизиты банка' })
		expect(screen.getByLabelText('Корреспондентский счёт')).toHaveAccessibleDescription('Проверьте реквизиты банка')
		await rerender({ kind: 'ogrnip', modelValue: '304500116000157', error: undefined, label: 'ОГРНИП предпринимателя' })
		expect(screen.getByLabelText('ОГРНИП предпринимателя')).not.toHaveAttribute('aria-invalid')
		await rerender({ modelValue: undefined })
		expect(screen.getByLabelText('ОГРНИП предпринимателя')).toHaveValue('')
	})

	it('is-disabled, язык и оформление', () => {
		setLocale('en')
		const { container } = render(BaseRequisiteInput, {
			props: { kind: 'account', isDisabled: true, variant: 'soft', customClass: { root: 'r', field: 'f' } },
		})
		const field = screen.getByLabelText('Settlement account')

		expect(field).toBeDisabled()
		expect(field).toHaveClass('f')
		expect(container.querySelector('.base-requisite-input')).toHaveClass('base-input--soft', 'r')
	})
})
