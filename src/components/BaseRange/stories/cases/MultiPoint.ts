import { expect } from 'storybook/test'
import type meta from '../BaseRange.stories'
import BaseRange from '../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const MultiPoint: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Несколько точек (`v-model:points`): например, опорные точки кривой громкости; соседние ползунки ограничивают друг друга.',
			},
		},
	},
	args: { points: [20, 45, 80], ariaLabel: undefined, hasLabel: true },
	render: args => {
		const onUpdate = useModelArg('points')
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb']), onUpdate }),
			template: '<div class="story-narrow"><BaseRange v-bind="props" @update:points="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		const middle = canvas.getByRole('slider', { name: 'Точка 2' })
		await expect(middle).toHaveAttribute('aria-valuemin', '20')
		await expect(middle).toHaveAttribute('aria-valuemax', '80')
	},
}
