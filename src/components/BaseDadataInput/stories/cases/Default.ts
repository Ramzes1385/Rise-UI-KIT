import { DEMO_DELAY } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseDadataInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDadataInput from '../../ui/BaseDadataInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { company: 'modelValue' }

const template = `
	<div style="max-width: 480px; min-height: 280px"><BaseDadataInput v-bind="args" v-model="company" /></div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Наберите «сбер» или ИНН «7736»: подсказки придут через 300 мс, во второй строке — ИНН и адрес. Стрелка вниз и Enter выбирают организацию.',
			},
			source: storySource({ template, imports: ['BaseDadataInput'], models }),
		},
	},
	render: args => ({
		components: { BaseDadataInput },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('combobox', { name: 'Организация' })
		await userEvent.tab()
		await expect(field).toHaveFocus()
		await userEvent.type(field, 'сбер')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: DEMO_DELAY * 10 })
		await expect(document.querySelector('[role="option"]')).toHaveTextContent('ИНН 7707083893 · г Москва, ул Вавилова, д 19')
		await userEvent.keyboard('{ArrowDown}{Enter}')
		await expect(field).toHaveValue('ПАО СБЕРБАНК')
	},
}
