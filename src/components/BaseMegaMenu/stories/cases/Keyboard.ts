import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab переводит фокус на пункт навигации, Enter открывает панель; следующий Tab — на узел панели,',
					'Enter раскрывает его вложенный уровень. Закрытия по Escape пока нет.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { layout: 'dropdown' },
	play: async ({ canvas, userEvent }) => {
		const products = canvas.getByRole('button', { name: 'Продукты' })
		await tabTo(products, userEvent)
		await expect(getComputedStyle(products).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(products).toHaveAttribute('aria-expanded', 'true')

		await userEvent.tab()
		const analytics = canvas.getByRole('button', { name: 'Аналитика' })
		await expect(analytics).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(analytics).toHaveAttribute('aria-expanded', 'true')
	},
}
