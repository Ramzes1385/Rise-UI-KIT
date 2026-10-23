import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseBreadcrumbs.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Клавиатура: Tab переводит фокус на крошку (видно кольцо фокуса), Enter выполняет переход.' } },
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const link = canvas.getByRole('link', { name: 'Главная' })
		await tabTo(link, userEvent)
		await expect(getComputedStyle(link).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onNavigate).toHaveBeenCalledWith('/')
	},
}
