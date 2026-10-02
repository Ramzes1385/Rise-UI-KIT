import { expect } from 'storybook/test'
import type meta from '../../BaseList.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённый список: строки не выбираются и не переставляются.' } } },
	args: { isDisabled: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('listbox', { name: 'Разделы' })).toHaveAttribute('aria-disabled', 'true')
	},
}
