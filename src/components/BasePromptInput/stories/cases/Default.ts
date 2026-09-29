import { ref } from 'vue'
import { expect } from 'storybook/test'
import { useModelArg } from '@/stories/helpers'
import type meta from '../BasePromptInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePromptInput from '../../ui/BasePromptInput.vue'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: v-model связан с Controls. Enter отправляет запрос, Shift+Enter — новая строка.' } },
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BasePromptInput },
			setup: () => ({ args, onUpdate, sent: ref<string[]>([]) }),
			template: `
				<div style="display: grid; gap: 12px; max-width: 640px">
					<BasePromptInput v-bind="args" @update:model-value="onUpdate" @submit="sent.push($event)" />
					<p v-if="sent.length" style="margin: 0; white-space: pre-line">Отправлено: {{ sent.at(-1) }}</p>
				</div>`,
		}
	},
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
