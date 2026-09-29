import type meta from '../../BaseTabs.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Без вкладок: пустой список `tablist`, панели нет.' } } },
	args: { items: [], modelValue: '' },
	play: async ({ canvas }) => {
		await expect(within(canvas.getByRole('tablist')).queryAllByRole('tab')).toHaveLength(0)
		await expect(canvas.queryByRole('tabpanel')).toBeNull()
	},
}
