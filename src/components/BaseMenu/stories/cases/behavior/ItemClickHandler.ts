import { fn, expect } from 'storybook/test'
import type meta from '../../BaseMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const ItemClickHandler: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Обработчик `click` у пункта вызывается перед событием `select` — удобно для действий, не зависящих от меню.',
			},
		},
	},
	args: {
		items: [
			[
				{ label: 'Копировать ссылку', icon: 'link', click: fn() },
				{ label: 'Скачать', icon: 'download' },
			],
		],
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Копировать ссылку' }))
		await expect(args.items[0][0].click).toHaveBeenCalledOnce()
		await expect(args.onSelect).toHaveBeenCalledOnce()
	},
}
