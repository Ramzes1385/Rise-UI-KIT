import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePromptInput.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: не получает фокус, кнопка отправки неактивна.' } } },
	args: { isDisabled: true, modelValue: 'Черновик запроса' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Сообщение' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Отправить' })).toBeDisabled()
	},
}
