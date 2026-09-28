import { expect } from 'storybook/test'
import type meta from '../BaseTimeline.stories'
import BaseTimeline from '../../ui/BaseTimeline.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Horizontal: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Горизонтальная лента: этапы слева направо, при нехватке места — прокрутка.' } } },
	args: { orientation: 'horizontal', variant: 'soft' },
	render: args => ({
		components: { BaseTimeline },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: '<BaseTimeline v-bind="props" />',
	}),
	play: async ({ canvasElement }) => {
		const list = canvasElement.querySelector('.base-timeline') as HTMLElement
		await expect(getComputedStyle(list).flexDirection).toBe('row')
	},
}
