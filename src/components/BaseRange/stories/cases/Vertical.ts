import { expect } from 'storybook/test'
import type meta from '../BaseRange.stories'
import BaseRange from '../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const Vertical: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Вертикальный слайдер (`isVertical`): высота 200px, значение растёт снизу вверх, деления — справа.' },
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
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['thumb']), onUpdate }),
			template: '<div style="padding: 8px 0;"><BaseRange v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('slider', { name: 'Громкость' })).toHaveAttribute('aria-orientation', 'vertical')
	},
}
