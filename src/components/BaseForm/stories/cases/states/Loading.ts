import { expect } from 'storybook/test'
import type meta from '../../BaseForm.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Загрузка: подложка с лоадером поверх полей, форма помечена `aria-busy`, нативные поля и кнопки отключены.',
					'Отправка в этом состоянии не вызывает `submit`.',
				].join('\n'),
			},
		},
	},
	args: { isLoading: true },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('form', { name: 'Подписка на рассылку' })).toHaveAttribute('aria-busy', 'true')
		await expect(canvas.getByRole('status')).toHaveAccessibleName('Загрузка')
		await expect(canvas.getByLabelText('Email')).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Подписаться' })).toBeDisabled()
	},
}
