import { useModelArg } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMoneyInput from '../../ui/BaseMoneyInput.vue'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Разряды появляются при вводе, после ухода из поля сумма дополняется копейками.' } },
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseMoneyInput },
			setup: () => ({ args, onUpdate }),
			template: '<div style="max-width: 320px"><BaseMoneyInput v-bind="args" @update:model-value="onUpdate" /></div>',
		}
	},
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
