import { findPanel, dayName } from '../../shared'
import type meta from '../../BaseDatePicker.stories'
import { storyDate, tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, waitFor, expect, screen } from 'storybook/test'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус в поле, Enter открывает панель и переводит фокус на выбранную дату; Tab — к следующему',
					'дню, Enter выбирает его, панель закрывается, фокус возвращается в поле. ↓ открывает панель снова, Escape закрывает.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { modelValue: storyDate(0, 0, 0) },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Дата встречи')
		await tabTo(field, userEvent)
		await userEvent.keyboard('{Enter}')
		const panel = within(await findPanel())
		await waitFor(() => expect(panel.getByRole('button', { name: dayName(0) })).toHaveFocus())

		await userEvent.tab()
		await expect(panel.getByRole('button', { name: dayName(1) })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveFocus()
		await expect(field).toHaveValue('16.05.2025')

		await userEvent.keyboard('{ArrowDown}')
		await findPanel()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveFocus()
	},
}
