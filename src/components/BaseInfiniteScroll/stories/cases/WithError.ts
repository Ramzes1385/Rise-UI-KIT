import { items, PAGE } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseInfiniteScroll.stories'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ошибка подгрузки: текст ошибки и кнопка «Повторить».' } } },
	args: { mode: 'manual' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Загрузить еще' }))
		await expect(await canvas.findByText('Не удалось загрузить')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(items(canvasElement)).toBe(PAGE * 2))
	},
}
