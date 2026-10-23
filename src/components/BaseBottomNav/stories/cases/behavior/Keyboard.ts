import { ITEMS } from '../../shared'
import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: пункты — обычные кнопки и ссылки, Tab переходит между ними (видно кольцо фокуса), Enter и Space выбирают пункт.',
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const chats = canvas.getByRole('button', { name: 'Чаты' })
		await tabTo(chats, userEvent)
		await expect(getComputedStyle(chats).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(chats).toHaveAttribute('aria-current', 'page')
		await expect(args.onSelect).toHaveBeenCalledWith(ITEMS[2])

		await userEvent.tab()
		const favorites = canvas.getByRole('button', { name: 'Избранное' })
		await expect(favorites).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(favorites).toHaveAttribute('aria-current', 'page')
	},
}
