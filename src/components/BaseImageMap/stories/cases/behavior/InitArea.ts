import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const InitArea: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Начальный вид — `initArea` (область в долях картинки): карта открывается приближенной к кафе «Солнце», «Сбросить масштаб» возвращает к этой области.',
					'`hasZoomToActive` — при выборе объекта карта приближается к нему.',
				].join('\n'),
			},
		},
	},
	args: { initArea: { x: 0.5, y: 0.1, width: 0.45, height: 0.45 }, hasZoomToActive: true, defaultAction: 'none' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const stage = canvasElement.querySelector('.base-image-map__stage') as HTMLElement
		await expect(canvas.getByRole('button', { name: 'Уменьшить' })).toBeEnabled()
		const initial = stage.style.transform
		await tabTo(canvas.getByRole('button', { name: 'Вершина' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(stage.style.transform).not.toBe(initial))
		await userEvent.click(canvas.getByRole('button', { name: 'Сбросить масштаб' }))
		await waitFor(() => expect(stage.style.transform).toBe(initial))
	},
}
