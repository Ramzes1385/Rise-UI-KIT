import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import BaseFilterBuilder from '../ui/BaseFilterBuilder.vue'
import { render, screen, within } from '@testing-library/vue'

describe('BaseFilterBuilder integration', () => {
	it('с клавиатуры: Tab к «Добавить условие», Enter, значение и удаление условия', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseFilterBuilder, { props: { fields: [{ key: 'title', label: 'Задача', type: 'text' }] } })

		await user.tab()
		expect(screen.getByRole('button', { name: 'Добавить условие' })).toHaveFocus()
		await user.keyboard('{Enter}')
		const condition = screen.getByRole('group', { name: 'Условие 1' })
		expect(within(condition).getByRole('combobox', { name: 'Поле' })).toHaveFocus()
		await user.tab()
		await user.tab()
		await user.keyboard('отчёт')
		expect(emitted('update:modelValue').at(-1)).toEqual([
			{ match: 'all', conditions: [expect.objectContaining({ field: 'title', operator: 'contains', value: 'отчёт' })] },
		])
		await user.tab()
		await user.keyboard('{Enter}')
		expect(screen.queryByRole('group', { name: 'Условие 1' })).toBeNull()
		expect(screen.getByRole('button', { name: 'Добавить условие' })).toHaveFocus()
	})
})
