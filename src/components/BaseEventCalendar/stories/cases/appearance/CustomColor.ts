import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseEventCalendar.stories'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`.' } },
	},
	args: { color: { bg: { base: '#f5f3ff' }, text: { base: '#2e1065' } } },
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-event-calendar') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).toBe('rgb(245, 243, 255)')
	},
}
