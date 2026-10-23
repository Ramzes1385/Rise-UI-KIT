import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const KeyboardAtEdge: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура на пределе: Enter на «Следующая страница» с предпоследней страницы открывает последнюю — стрелка',
					'становится недоступной (`aria-disabled`), но фокус остаётся на ней, а не уходит в начало страницы. Повторный Enter',
					'ничего не делает, Shift+Tab возвращает к номерам страниц.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { modelValue: 11, total: 120 },
	play: async ({ canvas, userEvent, args }) => {
		const next = canvas.getByRole('button', { name: 'Следующая страница' })
		await tabTo(next, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenCalledWith(12)
		await waitFor(() => expect(next).toHaveAttribute('aria-disabled', 'true'))
		await expect(next).toHaveFocus()
		await expect(getComputedStyle(next).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenCalledTimes(1)
		await userEvent.tab({ shift: true })
		await expect(canvas.getByRole('button', { name: 'Страница 12' })).toHaveFocus()
	},
}
