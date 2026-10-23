import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'

export const Preview: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кнопка «Просмотр» показывает карту так, как её увидит пользователь BaseImageMap: подсказки, окна, ссылки. Инструменты и масштаб холста в это время недоступны.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const preview = canvas.getByRole('button', { name: 'Просмотр' })
		await userEvent.click(preview)
		await expect(preview).toHaveAttribute('aria-pressed', 'true')
		await expect(canvas.queryByRole('application', { name: 'Холст карты' })).not.toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Вершина' })).toBeVisible()
		await expect(canvas.getByRole('radio', { name: 'Точка' })).toBeDisabled()
		await userEvent.click(preview)
		await expect(canvas.getByRole('application', { name: 'Холст карты' })).toBeVisible()
	},
}
