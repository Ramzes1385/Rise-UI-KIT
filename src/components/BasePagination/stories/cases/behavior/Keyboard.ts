import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: кнопки страниц и стрелки достижимы по Tab (заблокированная стрелка пропускается), Enter переключает',
					'страницу. Кольцо фокуса видно только при навигации с клавиатуры.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const second = canvas.getByRole('button', { name: '2' })
		await tabTo(second, userEvent)
		await expect(getComputedStyle(second).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenCalledWith(2)
		await waitFor(() => expect(canvas.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page'))
	},
}
