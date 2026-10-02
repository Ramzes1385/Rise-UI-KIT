import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

export const Locale: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	globals: { locale: 'en' },
	parameters: {
		docs: {
			description: {
				story: [
					"Язык кита — английский (`setLocale('en')` в приложении, переключатель «Язык» на панели Storybook): названия,",
					'форматы дат и доступные имена — из словаря, неделя начинается с воскресенья. `firstDayOfWeek` задаёт день вручную.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('grid')).toHaveAccessibleName('October 2026')
		await expect(canvas.getAllByRole('columnheader')[0]).toHaveTextContent(/sun/i)
		await expect(canvas.getByRole('button', { name: 'Today' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'All events on October 2' })).toHaveTextContent('+3 more')
	},
}
