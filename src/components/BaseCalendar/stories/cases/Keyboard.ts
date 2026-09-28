import { expect } from 'storybook/test'
import type meta from '../BaseCalendar.stories'
import { storyDate, tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { renderWithLocalModel, getDay } from '../shared'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: дни — обычные кнопки. Tab проходит по шапке и дням (видно кольцо фокуса), Enter и Space выбирают день,',
					'Enter на «Следующий месяц» листает месяц.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { modelValue: storyDate(0, 0, 0) },
	render: renderWithLocalModel(),
	play: async ({ canvas, userEvent }) => {
		const first = getDay(canvas, -14)
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(first).toHaveAttribute('aria-pressed', 'true')

		await userEvent.tab()
		await expect(getDay(canvas, -13)).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(getDay(canvas, -13)).toHaveAttribute('aria-pressed', 'true')
		await expect(first).toHaveAttribute('aria-pressed', 'false')

		const next = canvas.getByRole('button', { name: 'Следующий месяц' })
		next.focus()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('button', { name: /июнь 2025/i })).toBeInTheDocument()
	},
}
