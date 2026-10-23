import { expect } from 'storybook/test'
import type meta from '../BasePromptInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePromptInput from '../../ui/BasePromptInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { prompt: 'modelValue' }

const state = { sent: [] }

const template = `
	<div style="display: grid; gap: 12px; max-width: 640px">
		<BasePromptInput v-bind="args" v-model="prompt" @submit="sent.push($event)" />
		<p v-if="sent.length" style="margin: 0; white-space: pre-line">Отправлено: {{ sent.at(-1) }}</p>
	</div>
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: v-model связан с Controls. Enter отправляет запрос, Shift+Enter — новая строка.' },
			source: storySource({ template, imports: ['BasePromptInput'], models, state, types: { sent: 'string[]' } }),
		},
	},
	render: args => ({
		components: { BasePromptInput },
		setup: useStorySetup(args, { models, state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByRole('textbox', { name: 'Сообщение' })
		const send = canvas.getByRole('button', { name: 'Отправить' })
		await expect(field).toHaveAccessibleDescription('Enter — отправить, Shift+Enter — новая строка')
		await expect(send).toBeDisabled()
		await userEvent.tab()
		await expect(field).toHaveFocus()
		await userEvent.type(field, 'Как включить тёмную тему?')
		await userEvent.keyboard('{Shift>}{Enter}{/Shift}Коротко')
		await expect(field).toHaveValue('Как включить тёмную тему?\nКоротко')
		await expect(send).toBeEnabled()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByText(/^Отправлено:/)).toHaveTextContent('Отправлено: Как включить тёмную тему? Коротко')
		await expect(field).toHaveValue('')
		await expect(field).toHaveFocus()
	},
}
