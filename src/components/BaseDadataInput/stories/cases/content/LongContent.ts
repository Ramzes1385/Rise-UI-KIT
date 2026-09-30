import { DEMO_DELAY } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDadataInput.stories'
import BaseDadataInput from '../../../ui/BaseDadataInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { company: 'modelValue' }

const template = `
	<div style="max-width: 320px; min-height: 320px"><BaseDadataInput v-bind="args" v-model="company" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинное полное название университета в узком поле: в списке подсказка переносится по словам, ширина панели — как у поля.',
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
		await userEvent.type(field, 'университет')
		await waitFor(() => expect(document.querySelectorAll('[role="option"]')).toHaveLength(1), { timeout: DEMO_DELAY * 10 })
		const option = document.querySelector('[role="option"]') as HTMLElement
		await expect(option.scrollWidth).toBeLessThanOrEqual(option.clientWidth + 1)
	},
}
