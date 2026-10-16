import { expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Locale: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Явная локаль: `locale="en-US"` — названия по-английски и неделя с воскресенья (первый день берётся из локали; `firstDayOfWeek` переопределяет его).',
			},
		},
	},
	args: { modelValue: storyDate(0, 0, 0), locale: 'en-US' },
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('button', { name: /may 2025/i })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: /May 15, 2025/ })).toHaveAttribute('aria-pressed', 'true')
		await expect(canvasElement.querySelector('.base-calendar__weekday')?.textContent).toMatch(/^su/i)
	},
}
