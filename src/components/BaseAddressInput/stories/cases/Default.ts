import { DEMO_DELAY } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseAddressInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAddressInput from '../../ui/BaseAddressInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { address: 'modelValue' }

const template = `
	<div style="max-width: 420px; min-height: 280px"><BaseAddressInput v-bind="args" v-model="address" /></div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Наберите «тверская 13»: подсказки придут через 300 мс, стрелка вниз и Enter выбирают адрес.' },
			source: storySource({ template, imports: ['BaseAddressInput'], models }),
		},
	},
	render: args => ({
		components: { BaseAddressInput },
		setup: useStorySetup(args, { models }),
		template,
	}),
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
