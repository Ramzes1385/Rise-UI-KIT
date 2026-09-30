import { fn, expect } from 'storybook/test'
import type meta from '../../BaseMenu.stories'
import BaseMenu from '../../../ui/BaseMenu.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 240px;"><BaseMenu v-bind="args" :items="items" /></div>
`

export const ItemClickHandler: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Обработчик `click` у пункта вызывается перед событием `select` — удобно для действий, не зависящих от меню.',
			},
			source: storySource({
				template,
				imports: ['BaseMenu'],
				omit: ['items'],
				script: `
					const copyLink = () => navigator.clipboard.writeText(location.href)
					const items = [
						[
							{ label: 'Копировать ссылку', icon: 'link', click: copyLink },
							{ label: 'Скачать', icon: 'download' },
						],
					]
				`,
			}),
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
	render: args => ({
		components: { BaseMenu },
		setup: useStorySetup(args, { data: { items: args.items }, slots: ['default', 'items'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Копировать ссылку' }))
		await expect(args.items[0][0].click).toHaveBeenCalledOnce()
		await expect(args.onSelect).toHaveBeenCalledOnce()
	},
}
