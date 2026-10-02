import { expect } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Clickable: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`clickable: completed` — вернуться можно только к пройденным шагам: они и текущий шаг — кнопки, будущие —',
					'просто текст, в порядок Tab не попадают. `none` — степпер только показывает прогресс, кнопок нет.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 3, clickable: 'completed' },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getAllByRole('button')).toHaveLength(3)
		await expect(canvas.queryByRole('button', { name: /Подтверждение/ })).toBeNull()
		await userEvent.click(canvas.getByText('Подтверждение'))
		await expect(args.onChange).not.toHaveBeenCalled()

		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Корзина, пройден' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(args.onChange).toHaveBeenCalledWith(1)
	},
}
