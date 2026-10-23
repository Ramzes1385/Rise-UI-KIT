import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseRequisiteInput.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseRequisiteInput from '../../ui/BaseRequisiteInput.vue'

const models = { value: 'modelValue' }

const template = `
	<div style="max-width: 320px"><BaseRequisiteInput v-bind="args" v-model="value" /></div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'ИНН: неверная контрольная цифра видна после ухода из поля; верный ИНН Сбербанка — 7707083893.' },
			source: storySource({ template, imports: ['BaseRequisiteInput'], models }),
		},
	},
	render: args => ({
		components: { BaseRequisiteInput },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('ИНН')
		await userEvent.tab()
		await expect(field).toHaveFocus()
		await userEvent.type(field, '7707083894')
		await expect(field).not.toHaveAttribute('aria-invalid', 'true')
		await userEvent.tab()
		await waitFor(() => expect(field).toHaveAccessibleDescription('Неверное контрольное число'))
		await userEvent.clear(field)
		await userEvent.type(field, '7707083893')
		await userEvent.tab()
		await waitFor(() => expect(field).not.toHaveAttribute('aria-invalid', 'true'))
	},
}
