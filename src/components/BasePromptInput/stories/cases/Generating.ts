import { expect } from 'storybook/test'
import type meta from '../BasePromptInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Generating: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Идёт ответ: «Остановить ответ» вместо «Отправить», Enter не отправляет следующий запрос.' } },
	},
	args: { isGenerating: true, modelValue: 'Следующий вопрос' },
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('textbox')
		await userEvent.click(field)
		await userEvent.keyboard('{Enter}')
		await expect(args.onSubmit).not.toHaveBeenCalled()
		await expect(field).toHaveValue('Следующий вопрос')
		await userEvent.click(canvas.getByRole('button', { name: 'Остановить ответ' }))
		await expect(args.onStop).toHaveBeenCalledOnce()
	},
}
