import { expect } from 'storybook/test'
import type meta from '../../BaseMention.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: не получает фокус и не реагирует на ввод.' } } },
	args: { isDisabled: true, modelValue: '@anna, посмотри макет' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('textbox', { name: 'Комментарий' })).toBeDisabled()
	},
}
