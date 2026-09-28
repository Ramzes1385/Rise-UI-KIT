import { expect } from 'storybook/test'
import type meta from '../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { MegaMenuColumn } from '../../types/BaseMegaMenu.types'

const DEEP_COLUMNS: MegaMenuColumn[] = [
	{
		title: 'Каталог',
		icon: 'folder',
		items: [
			{
				label: 'Электроника',
				children: [
					{
						label: 'Компьютеры',
						children: [
							{
								label: 'Ноутбуки',
								children: [{ label: 'Ультрабуки', to: '/catalog/electronics/computers/laptops/ultrabooks' }],
							},
						],
					},
				],
			},
		],
	},
]

export const DeepNesting: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Вложенность не ограничена: в раскладке columns уровни раскрываются вниз, каждый с линией слева.' } },
	},
	args: { columns: DEEP_COLUMNS },
	play: async ({ canvas, userEvent, args }) => {
		for (const label of ['Электроника', 'Компьютеры', 'Ноутбуки']) {
			await userEvent.click(await canvas.findByRole('button', { name: label }))
		}
		await userEvent.click(await canvas.findByRole('link', { name: 'Ультрабуки' }))
		await expect(args.onNavigate).toHaveBeenCalledWith('/catalog/electronics/computers/laptops/ultrabooks')
	},
}
