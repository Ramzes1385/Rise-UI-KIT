import { expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../BaseCalendar.stories'
import { renderWithLocalModel } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const Time12Hour: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'12-часовой формат (`timeConfig.is24Hour: false`): часы 1–12 и переключатель AM/PM. Половина суток следует из',
					'значения (14:30 — это 2:30 PM), переключатель сдвигает время на 12 часов в пределах того же дня.',
				].join('\n'),
			},
		},
	},
	args: {
		modelValue: storyDate(0, 14, 30),
		timeConfig: { showTime: true, is24Hour: false },
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByLabelText('Часы')).toHaveValue(2)
		const toggle = canvas.getByRole('button', { name: 'PM' })
		await userEvent.click(toggle)
		await expect(toggle).toHaveTextContent('AM')
		await expect(args['onUpdate:modelValue']).toHaveBeenLastCalledWith(storyDate(0, 2, 30))
	},
}
