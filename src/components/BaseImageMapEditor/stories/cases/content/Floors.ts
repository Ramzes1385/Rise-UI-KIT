import { statusOf } from '../../shared'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import { IMAGE_MAP_FLOORS } from '@components/BaseImageMap/stories/fixtures'

export const Floors: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Карта этажей из SVG-планов: павильоны — объекты `svg`, связанные с элементами плана по `id`.',
					'«Объекты из SVG» создаёт объекты для элементов с `id`, у которых их ещё нет; этажи переключаются и упорядочиваются в панели «Этажи».',
				].join('\n'),
			},
		},
	},
	args: { modelValue: IMAGE_MAP_FLOORS },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'Этаж 1' })).toHaveAttribute('aria-current', 'true')
		await expect(canvas.queryByRole('button', { name: /^Магазин 103/ })).not.toBeInTheDocument()
		await userEvent.click(canvas.getByRole('button', { name: 'Объекты из SVG' }))
		await expect(statusOf(canvasElement)).toHaveTextContent('Добавлено объектов из SVG: 4')
		await expect(canvas.getByRole('button', { name: /^f1-shop-3/ })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Этаж 2' }))
		await expect(canvas.getByRole('button', { name: 'Этаж 2' })).toHaveAttribute('aria-current', 'true')
		await expect(canvas.getByRole('button', { name: /^Магазин 201/ })).toBeVisible()
	},
}
