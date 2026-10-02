import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab переводит фокус между заголовками (видно кольцо фокуса), Enter и Space раскрывают и закрывают пункт.',
					'Кнопка пункта — нативная `<button>` внутри заголовка `<h3>`: скринридер находит пункты в списке заголовков.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const first = canvas.getByRole('button', { name: 'Как оформить заказ?' })
		await expect(canvas.getAllByRole('heading', { level: 3 })[0]).toContainElement(first)
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).outlineStyle).toBe('solid')

		await userEvent.keyboard('{Enter}')
		await expect(first).toHaveAttribute('aria-expanded', 'false')
		await expect(args.onToggle).toHaveBeenLastCalledWith(0, false)

		await userEvent.tab()
		const second = canvas.getByRole('button', { name: 'Сколько стоит доставка?' })
		await expect(second).toHaveFocus()
		await userEvent.keyboard(' ')
		await expect(second).toHaveAttribute('aria-expanded', 'true')
		await expect(args.onToggle).toHaveBeenLastCalledWith(1, true)
	},
}
