import { storyDate } from '@/stories/helpers'
import { within, expect } from 'storybook/test'
import type meta from '../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, renderWithLocalModel, findPanel, dayName } from '../shared'

export const Constraints: StoryObj<typeof meta> = {
	args: {
		label: 'Дата доставки',
		modelValue: storyDate(1, 0, 0),
		minDate: storyDate(0, 0, 0),
		maxDate: storyDate(30, 0, 0),
		disabledWeekdays: [0, 6],
	},
	parameters: {
		docs: {
			...docsFrame(420),
			description: { story: 'Ограничения: `minDate`/`maxDate` и `disabledWeekdays` — недоступные дни приглушены и не выбираются.' },
		},
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByLabelText('Дата доставки'))
		const panel = within(await findPanel())
		await expect(panel.getByRole('button', { name: dayName(-1) })).toBeDisabled()
		await expect(panel.getByRole('button', { name: dayName(2) })).toBeDisabled()
		await expect(panel.getByRole('button', { name: dayName(4) })).toBeEnabled()
	},
}
