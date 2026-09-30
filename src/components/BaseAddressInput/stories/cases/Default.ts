import { DEMO_DELAY } from '../shared'
import { useModelArg } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseAddressInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAddressInput from '../../ui/BaseAddressInput.vue'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Наберите «тверская 13»: подсказки придут через 300 мс, стрелка вниз и Enter выбирают адрес.' } },
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseAddressInput },
			setup: () => ({ args, onUpdate }),
			template:
				'<div style="max-width: 420px; min-height: 280px"><BaseAddressInput v-bind="args" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Адрес доставки' })
		await userEvent.tab()
		await expect(field).toHaveFocus()
		await userEvent.type(field, 'тверская 13')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: DEMO_DELAY * 10 })
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(field).toHaveValue('г Москва, ул Тверская, д 13')
	},
}
