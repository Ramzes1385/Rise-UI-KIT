import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `
	<div style="padding: 8px 0;"><BaseRange v-bind="args" v-model="value" /></div>
`

export const Vertical: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Вертикальный слайдер (`isVertical`): высота 200px, значение растёт снизу вверх, деления — справа.' },
			source: storySource({ template, imports: ['BaseRange'], models, omit: ['thumb'] }),
		},
	},
	args: {
		isVertical: true,
		modelValue: 65,
		marks: [
			{ value: 0, label: '0' },
			{ value: 50, label: '50' },
			{ value: 100, label: '100' },
		],
	},
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { models, slots: ['thumb'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('slider', { name: 'Громкость' })).toHaveAttribute('aria-orientation', 'vertical')
	},
}
