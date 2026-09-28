import type meta from '../BaseRange.stories'
import BaseRange from '../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'
import { useModelArg, useArgsWithoutSlots, tabTo } from '@/stories/helpers'

export const WithTooltip: StoryObj<typeof meta> = {
	args: { rangeValue: [25, 75], hasTooltip: true, ariaLabel: 'Громкость' },
	parameters: {
		docs: {
			description: {
				story: 'Подсказка со значением (`hasTooltip`) — как BaseTooltip: появляется при наведении и при фокусе с клавиатуры.',
			},
			story: { inline: false, height: '140px' },
		},
	},
	render: args => {
		const onUpdate = useModelArg('rangeValue')
		return {
			components: { BaseRange },
			setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb']), onUpdate }),
			template:
				'<div class="story-narrow" style="padding-top: 40px;"><BaseRange v-bind="props" @update:range-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('slider', { name: 'Громкость: минимум' }), userEvent)
		const tooltip = await screen.findByRole('tooltip')
		await waitFor(() => expect(tooltip).toBeVisible())
		await expect(tooltip).toHaveTextContent('25')
	},
}
