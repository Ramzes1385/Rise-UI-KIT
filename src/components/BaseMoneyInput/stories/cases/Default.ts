import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMoneyInput from '../../ui/BaseMoneyInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { amount: 'modelValue' }

const template = `
	<div style="max-width: 320px"><BaseMoneyInput v-bind="args" v-model="amount" /></div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Разряды появляются при вводе, после ухода из поля сумма дополняется копейками.' },
			source: storySource({ template, imports: ['BaseMoneyInput'], models }),
		},
	},
	render: args => ({
		components: { BaseMoneyInput },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Сумма')
		await expect((field as HTMLInputElement).value).toMatch(/^1\s234,50$/)
		await userEvent.tab()
		await expect(field).toHaveFocus()
		await userEvent.clear(field)
		await userEvent.type(field, '2500000,5')
		await expect((field as HTMLInputElement).value).toMatch(/^2\s500\s000,5$/)
		await userEvent.tab()
		await waitFor(() => expect((field as HTMLInputElement).value).toMatch(/^2\s500\s000,50$/))
	},
}
