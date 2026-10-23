import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const SwitchView: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Смена вида: заголовок переключает дни → месяцы → годы (событие `view-change`), выбор года и месяца возвращает к дням.',
					'«Сегодня» возвращает к текущему месяцу и выбирает сегодняшний день.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: /май 2025/i }))
		await userEvent.click(canvas.getByRole('button', { name: '2025' }))
		await expect(args['onView-change']).toHaveBeenLastCalledWith('years')

		await userEvent.click(canvas.getByRole('button', { name: '2026' }))
		await userEvent.click(canvas.getByRole('button', { name: /март/i }))
		await expect(canvas.getByRole('button', { name: /март 2026/i })).toBeInTheDocument()
		await expect(args['onView-change']).toHaveBeenLastCalledWith('days')

		await userEvent.click(canvas.getByRole('button', { name: 'Сегодня' }))
		await waitFor(() => expect(canvas.getByRole('button', { current: 'date' })).toHaveAttribute('aria-pressed', 'true'))
	},
}
