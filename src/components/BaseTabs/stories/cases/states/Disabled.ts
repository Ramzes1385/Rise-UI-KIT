import { expect } from 'storybook/test'
import type meta from '../../BaseTabs.stories'
import { TABS_WITH_DISABLED } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённая вкладка приглушена, не выбирается кликом и пропускается стрелками.' } } },
	args: { items: TABS_WITH_DISABLED },
	play: async ({ canvas, userEvent, args }) => {
		const disabled = canvas.getByRole('tab', { name: 'Доставка' })
		await expect(disabled).toBeDisabled()
		await userEvent.click(disabled)
		await expect(args.onChange).not.toHaveBeenCalled()
		await expect(disabled).toHaveAttribute('aria-selected', 'false')
	},
}
