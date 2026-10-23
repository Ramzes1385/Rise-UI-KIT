import '@testing-library/jest-dom/vitest'
import BaseCalendar from '../ui/BaseCalendar.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseCalendar: стрелки месяца на пределе', () => {
	it('«Следующий месяц» у maxDate остаётся в фокусе, aria-disabled, повторное нажатие не листает', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseCalendar, {
			props: { modelValue: new Date(2025, 3, 10), constraints: { maxDate: new Date(2025, 4, 20) } },
		})
		const next = screen.getByRole('button', { name: 'Следующий месяц' })

		next.focus()
		await user.keyboard('{Enter}')

		expect(next).toHaveAttribute('aria-disabled', 'true')
		expect(next).not.toHaveAttribute('disabled')
		expect(document.activeElement).toBe(next)
		expect(emitted()['month-change']).toHaveLength(1)

		await user.keyboard('{Enter}')
		expect(emitted()['month-change']).toHaveLength(1)
	})

	it('«Предыдущий месяц» у minDate сразу aria-disabled и в порядке Tab', async () => {
		const user = userEvent.setup()
		render(BaseCalendar, { props: { modelValue: new Date(2025, 4, 10), constraints: { minDate: new Date(2025, 4, 1) } } })
		const prev = screen.getByRole('button', { name: 'Предыдущий месяц' })

		await user.tab()

		expect(prev).toHaveAttribute('aria-disabled', 'true')
		expect(document.activeElement).toBe(prev)
	})

	it('отключённый календарь — у стрелок нативный disabled', () => {
		render(BaseCalendar, {
			props: { modelValue: new Date(2025, 4, 10), constraints: { minDate: new Date(2025, 4, 1) }, isDisabled: true },
		})

		expect(screen.getByRole('button', { name: 'Предыдущий месяц' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Следующий месяц' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Предыдущий месяц' })).not.toHaveAttribute('aria-disabled')
	})
})
