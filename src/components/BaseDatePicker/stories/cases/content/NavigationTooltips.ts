import { findPanel } from '../../shared'
import { storyDate } from '@/stories/helpers'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { within, waitFor, expect, screen } from 'storybook/test'

export const NavigationTooltips: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Подсказки кнопок навигации панели: «Предыдущий год», «Предыдущий месяц», «Следующий месяц», «Следующий год».',
					'Подсказка (BaseTooltip) появляется при наведении и при фокусе с клавиатуры (Tab); имя кнопки для чтения с экрана — то же.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { modelValue: storyDate(0, 0, 0) },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByLabelText('Дата встречи'))
		const panel = within(await findPanel())

		const next = panel.getByRole('button', { name: 'Следующий месяц' })
		await userEvent.hover(next)
		await expect(await screen.findByRole('tooltip')).toHaveTextContent('Следующий месяц')
		await userEvent.click(next)
		await expect(next).toHaveFocus()
		await userEvent.unhover(next)

		await userEvent.tab()
		await expect(panel.getByRole('button', { name: 'Следующий год' })).toHaveFocus()
		await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Следующий год'))
	},
}
