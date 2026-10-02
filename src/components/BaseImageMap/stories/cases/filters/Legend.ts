import { expect, within } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Legend: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Легенда под картой (`hasLegend`): все группы из `data.groups` — кружок цвета группы со значком и название. Работает и без списка объектов.',
			},
		},
	},
	args: { hasLegend: true },
	play: async ({ canvas }) => {
		const legend = within(canvas.getByRole('list', { name: 'Легенда' }))
		await expect(legend.getAllByRole('listitem').map(item => item.textContent?.trim())).toEqual([
			'Кафе и рестораны',
			'Магазины',
			'Сервис',
		])
	},
}
