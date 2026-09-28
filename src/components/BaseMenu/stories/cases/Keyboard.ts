import { ITEMS } from '../shared'
import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab переводит фокус между пунктами (подсветка и кольцо фокуса), Enter и Space выбирают пункт.',
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const open = canvas.getByRole('button', { name: 'Открыть' })
		await tabTo(open, userEvent)
		await expect(getComputedStyle(open).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenLastCalledWith(ITEMS[0][0])

		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Скачать' })).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(args.onSelect).toHaveBeenLastCalledWith(ITEMS[0][1])
	},
}
