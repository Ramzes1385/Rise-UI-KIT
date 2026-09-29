import { expect } from 'storybook/test'
import type meta from '../BaseToolCall.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Вызов завершился ошибкой: текст ошибки в подробностях.' } } },
	args: {
		name: 'create_invoice',
		title: 'Создание счёта',
		status: 'error',
		args: { customer: 'ООО «Ромашка»', amount: 12500 },
		result: undefined,
		error: 'Нет доступа к API бухгалтерии: истёк токен',
		isOpen: true,
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: /Ошибка$/ })).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByText(/истёк токен/)).toBeVisible()
	},
}
