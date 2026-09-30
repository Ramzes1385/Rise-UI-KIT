import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { range: 'rangeValue' }

const template = `
	<div class="story-narrow" style="padding-top: 40px;"><BaseRange v-bind="args" v-model:range-value="range" /></div>
`

export const WithTooltip: StoryObj<typeof meta> = {
	args: { rangeValue: [25, 75], hasTooltip: true, ariaLabel: 'Громкость' },
	parameters: {
		docs: {
			description: {
				story: 'Подсказка со значением (`hasTooltip`) — как BaseTooltip: появляется при наведении и при фокусе с клавиатуры.',
			},
			story: { inline: false, height: '140px' },
			source: storySource({ template, imports: ['BaseRange'], models, omit: ['modelValue', 'thumb'] }),
		},
	},
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { models, slots: ['modelValue', 'thumb'] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await tabTo(canvas.getByRole('slider', { name: 'Громкость: минимум' }), userEvent)
		const tooltip = await screen.findByRole('tooltip')
		await waitFor(() => expect(tooltip).toBeVisible())
		await expect(tooltip).toHaveTextContent('25')
	},
}
