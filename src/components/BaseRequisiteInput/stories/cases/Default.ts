import { useModelArg } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseRequisiteInput.stories'
import BaseRequisiteInput from '../../ui/BaseRequisiteInput.vue'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'ИНН: неверная контрольная цифра видна после ухода из поля; верный ИНН Сбербанка — 7707083893.' } },
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseRequisiteInput },
			setup: () => ({ args, onUpdate }),
			template: '<div style="max-width: 320px"><BaseRequisiteInput v-bind="args" @update:model-value="onUpdate" /></div>',
		}
	},
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
