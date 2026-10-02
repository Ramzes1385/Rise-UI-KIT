import { expect } from 'storybook/test'
import type meta from '../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённое поле: не получает фокус и не реагирует на ввод.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByLabelText('Название')).toBeDisabled()
	},
}
