import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarCropper.stories'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Отключено: область не в порядке Tab, фото не двигается, ползунок недоступен.' } },
	},
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		const area = canvas.getByRole('group', { name: 'Кадрирование фото' })
		await expect(area).toHaveAttribute('aria-disabled', 'true')
		await expect(area).not.toHaveAttribute('tabindex')
	},
}
