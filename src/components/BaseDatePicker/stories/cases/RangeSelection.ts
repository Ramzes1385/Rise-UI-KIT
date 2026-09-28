import { storyDate } from '@/stories/helpers'
import type meta from '../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, within, waitFor, screen } from 'storybook/test'
import { docsFrame, renderWithLocalModel, findPanel, dayName } from '../shared'

export const RangeSelection: StoryObj<typeof meta> = {
	args: {
		label: 'Даты поездки',
		selectionMode: 'range',
		modelValue: storyDate(-3, 0, 0),
		modelValueEnd: storyDate(3, 0, 0),
		isMultiMonth: true,
	},
	parameters: {
		docs: {
			...docsFrame(460),
			description: {
				story: [
					'Диапазон на двух месяцах: `selectionMode="range"` и `isMultiMonth` — панель шириной с поле, месяцев столько,',
					'сколько помещается. Первый клик — начало, второй — конец: панель закрывается, в поле — «начало — конец».',
				].join('\n'),
			},
		},
	},
	render: renderWithLocalModel('story-medium'),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Даты поездки')
		await expect(field).toHaveValue('12.05.2025 — 18.05.2025')

		await userEvent.click(field)
		const [may, june] = Array.from((await findPanel()).querySelectorAll<HTMLElement>('.base-calendar'))
		await expect(within(may).getByRole('button', { name: dayName(0) })).toHaveAttribute('aria-pressed', 'true')
		await userEvent.click(within(may).getByRole('button', { name: dayName(4) }))
		await userEvent.click(within(june).getByRole('button', { name: dayName(19) }))
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(field).toHaveValue('19.05.2025 — 03.06.2025')

		await userEvent.click(field)
		const reopened = await findPanel()
		await expect(within(reopened).getByRole('button', { name: dayName(6) })).toHaveAttribute('aria-pressed', 'true')
	},
}
