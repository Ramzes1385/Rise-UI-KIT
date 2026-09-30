import { expect } from 'storybook/test'
import type meta from '../BaseTimeline.stories'
import BaseTimeline from '../../ui/BaseTimeline.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseTimeline v-bind="args" />
`

export const Horizontal: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Горизонтальная лента: этапы слева направо, при нехватке места — прокрутка.' },
			source: storySource({ template, imports: ['BaseTimeline'] }),
		},
	},
	args: { orientation: 'horizontal', variant: 'soft' },
	render: args => ({
		components: { BaseTimeline },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const list = canvasElement.querySelector('.base-timeline') as HTMLElement
		await expect(getComputedStyle(list).flexDirection).toBe('row')
	},
}
