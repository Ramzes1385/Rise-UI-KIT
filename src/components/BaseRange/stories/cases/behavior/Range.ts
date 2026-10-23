import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { range: 'rangeValue' }

const template = `
	<div class="story-narrow"><BaseRange v-bind="args" v-model:range-value="range" /></div>
`

export const Range: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Диапазон (`v-model:range-value`): два ползунка не пересекаются, заполнение — между ними.' },
			source: storySource({ template, imports: ['BaseRange'], models, omit: ['modelValue', 'thumb'] }),
		},
	},
	args: { rangeValue: [1500, 4500], min: 0, max: 10000, step: 100, ariaLabel: 'Цена', hasLabel: true },
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { models, slots: ['modelValue', 'thumb'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const min = canvas.getByRole('slider', { name: 'Цена: минимум' })
		const max = canvas.getByRole('slider', { name: 'Цена: максимум' })
		await expect(min).toHaveAttribute('aria-valuemax', '4500')
		await expect(max).toHaveAttribute('aria-valuemin', '1500')
	},
}
