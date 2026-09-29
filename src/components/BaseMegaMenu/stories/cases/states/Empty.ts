import { expect } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Без колонок и пунктов меню пустое.' } } },
	args: { columns: [] },
	play: async ({ canvas }) => {
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
	},
}
