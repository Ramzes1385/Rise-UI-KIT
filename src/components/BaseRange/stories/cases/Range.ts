import { expect } from 'storybook/test'
import type meta from '../BaseRange.stories'
import BaseRange from '../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const Range: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Диапазон (`v-model:range-value`): два ползунка не пересекаются, заполнение — между ними.' } },
	},
	args: { rangeValue: [1500, 4500], min: 0, max: 10000, step: 100, ariaLabel: 'Цена', hasLabel: true },
	render: args => {
		const onUpdate = useModelArg('rangeValue')
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb']), onUpdate }),
			template: '<div class="story-narrow"><BaseRange v-bind="props" @update:range-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas }) => {
		const min = canvas.getByRole('slider', { name: 'Цена: минимум' })
		const max = canvas.getByRole('slider', { name: 'Цена: максимум' })
		await expect(min).toHaveAttribute('aria-valuemax', '4500')
		await expect(max).toHaveAttribute('aria-valuemin', '1500')
	},
}
