import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Загрузка: спиннер вместо текста, ширина кнопки не меняется. Кнопка остаётся фокусируемой',
					'и сообщает о загрузке через `aria-busy`; клик не вызывает событие.',
				].join('\n'),
			},
		},
	},
	args: { isLoading: true, default: 'Сохранение' },
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Сохранение' })
		await expect(button).toHaveAttribute('aria-busy', 'true')
		await expect(button).toHaveAttribute('aria-disabled', 'true')
		await tabTo(button, userEvent)
		await userEvent.click(button)
		await expect(args.onClick).not.toHaveBeenCalled()
	},
}
