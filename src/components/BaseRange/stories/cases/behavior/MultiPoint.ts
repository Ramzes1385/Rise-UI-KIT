import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { points: 'points' }

const template = `
	<div class="story-narrow"><BaseRange v-bind="args" v-model:points="points" /></div>
`

export const MultiPoint: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Несколько точек (`v-model:points`): например, опорные точки кривой громкости; соседние ползунки ограничивают друг друга.',
			},
			source: storySource({ template, imports: ['BaseRange'], models, omit: ['modelValue', 'thumb'] }),
		},
	},
	args: { points: [20, 45, 80], ariaLabel: undefined, hasLabel: true },
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { models, slots: ['modelValue', 'thumb'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const middle = canvas.getByRole('slider', { name: 'Точка 2' })
		await expect(middle).toHaveAttribute('aria-valuemin', '20')
		await expect(middle).toHaveAttribute('aria-valuemax', '80')
	},
}
