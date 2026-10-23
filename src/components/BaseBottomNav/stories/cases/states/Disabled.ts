import { DISABLED_ITEMS } from '../../shared'
import { expect, fireEvent } from 'storybook/test'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Выключенный пункт (`isDisabled`) — кнопка `disabled` или ссылка без адреса: не получает фокус и не выбирается.',
			},
		},
	},
	args: { items: DISABLED_ITEMS },
	play: async ({ canvas, args }) => {
		const upload = canvas.getByRole('button', { name: 'Загрузка' })
		await expect(upload).toBeDisabled()
		await fireEvent.click(upload)
		await expect(args.onSelect).not.toHaveBeenCalled()
		await expect(upload).not.toHaveAttribute('aria-current')
	},
}
