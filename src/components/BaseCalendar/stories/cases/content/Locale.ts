import { expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Locale: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Локаль и первый день недели: `locale="en-US"` и `:first-day-of-week="0"` — неделя с воскресенья.' },
		},
	},
	args: { modelValue: storyDate(0, 0, 0), locale: 'en-US', firstDayOfWeek: 0 },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /may 2025/i })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: /May 15, 2025/ })).toHaveAttribute('aria-pressed', 'true')
	},
}
