import { storyDate } from '@/stories/helpers'
import type meta from '../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, expect, waitFor, screen } from 'storybook/test'
import { docsFrame, renderWithLocalModel, findPanel, dayName } from '../shared'

export const MultipleSelection: StoryObj<typeof meta> = {
	args: {
		label: 'Дни дежурства',
		selectionMode: 'multiple',
		selectedDates: [storyDate(-7, 0, 0), storyDate(0, 0, 0)],
	},
	parameters: {
		docs: {
			...docsFrame(420),
			description: {
				story: 'Несколько дат (`selectionMode="multiple"`): панель не закрывается после клика; до трёх дат видны в поле списком.',
			},
		},
	},
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Дни дежурства')
		await userEvent.click(field)
		const panel = within(await findPanel())
		await userEvent.click(panel.getByRole('button', { name: dayName(7) }))
		await expect(field).toHaveValue('08.05.2025, 15.05.2025, 22.05.2025')
		await waitFor(() => expect(screen.getByRole('dialog')).toBeVisible())
	},
}
