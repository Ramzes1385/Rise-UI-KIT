import { expect } from 'storybook/test'
import type meta from '../../BaseRoadmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { miniProgress, miniRoadmap } from '../../demo/mini'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Кастомный цвет через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`.' } },
	},
	args: {
		data: miniRoadmap,
		progress: miniProgress,
		layout: 'list',
		expanded: ['basics'],
		selected: null,
		color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } },
	},
	play: async ({ canvasElement }) => {
		const element = canvasElement.querySelector('.base-roadmap') as HTMLElement
		await expect(getComputedStyle(element).backgroundColor).toBe('rgb(109, 40, 217)')
	},
}
