import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseRequisiteInput from '../ui/BaseRequisiteInput.vue'

describe('BaseRequisiteInput integration', () => {
	it('Tab в поле, ввод СНИЛС по маске, Tab из поля — ошибка контрольного числа', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseRequisiteInput, { props: { kind: 'snils' } })

		await user.tab()
		const field = screen.getByLabelText('СНИЛС')
		expect(field).toHaveFocus()
		await user.keyboard('11223344596')
		expect(field).toHaveValue('112-233-445 96')
		expect(emitted('update:modelValue').at(-1)).toEqual(['11223344596'])
		expect(field).toHaveAccessibleDescription('Неверное контрольное число')
		await user.tab()
		expect(field).toHaveAttribute('aria-invalid', 'true')
	})
})
