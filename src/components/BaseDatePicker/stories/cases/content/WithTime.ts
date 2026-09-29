import { storyDate } from '@/stories/helpers'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, expect, waitFor, screen } from 'storybook/test'
import { docsFrame, renderWithLocalModel, findPanel, dayName } from '../../shared'

export const WithTime: StoryObj<typeof meta> = {
	args: { label: 'Начало встречи', modelValue: storyDate(0, 14, 30), showTime: true },
	parameters: {
		docs: {
			...docsFrame(480),
			description: {
				story: [
					'Время (`showTime`): под календарём — поля часов и минут; выбор дня сохраняет время и не закрывает панель.',
					'`showSeconds` добавляет секунды, `:is24-hour="false"` — 12-часовой формат с AM/PM.',
				].join('\n'),
			},
		},
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Начало встречи')
		await userEvent.click(field)
		const panel = within(await findPanel())
		await expect(panel.getByLabelText('Часы')).toHaveValue(14)
		await userEvent.click(panel.getByRole('button', { name: dayName(5) }))
		await expect(field).toHaveValue('20.05.2025, 14:30')
		await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible())
	},
}
