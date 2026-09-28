import { expect } from 'storybook/test'
import type meta from '../BaseEditor.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	args: { modelValue: '', isReadonly: true, placeholder: 'Загрузка документа…' },
	parameters: {
		docs: {
			description: {
				story: [
					'Загрузка документа. Отдельного состояния загрузки у редактора нет: пока HTML не пришёл, покажите редактор',
					'только для чтения с плейсхолдером «Загрузка…», после ответа сервера передайте HTML и снимите `isReadonly`.',
				].join('\n'),
			},
			source: {
				code: '<BaseEditor v-model="html" :is-readonly="isLoading" :placeholder="isLoading ? \'Загрузка документа…\' : \'\'" />',
			},
		},
	},
	play: async ({ canvas }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await expect(textbox).toHaveAttribute('aria-readonly', 'true')
		await expect(textbox).toHaveAttribute('aria-placeholder', 'Загрузка документа…')
	},
}
