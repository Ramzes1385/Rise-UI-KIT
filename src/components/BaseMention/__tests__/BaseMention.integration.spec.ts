import '@testing-library/jest-dom/vitest'
import BaseMention from '../ui/BaseMention.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseMention integration', () => {
	it('набор @ и начала имени, стрелка вниз и Enter вставляют упоминание', async () => {
		const user = userEvent.setup()
		const options = [
			{ value: 'anna', label: 'Анна' },
			{ value: 'ivan', label: 'Иван' },
		]
		const { emitted } = render(BaseMention, { props: { label: 'Комментарий', options } })
		const field = screen.getByRole('textbox', { name: 'Комментарий' })

		await user.tab()
		await user.keyboard('Смотри @')
		expect(screen.getAllByRole('option')).toHaveLength(2)
		await user.keyboard('{ArrowDown}{Enter}')
		expect(field).toHaveValue('Смотри @ivan ')
		expect(emitted('mention')).toEqual([[options[1]]])
		await user.keyboard('ок')
		expect(field).toHaveValue('Смотри @ivan ок')
		expect(screen.queryByRole('listbox')).toBeNull()
	})
})
