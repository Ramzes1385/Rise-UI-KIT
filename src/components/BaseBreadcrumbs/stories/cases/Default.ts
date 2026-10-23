import { ITEMS } from '../shared'
import { expect, within } from 'storybook/test'
import type meta from '../BaseBreadcrumbs.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: крошки — ссылки; клик эмитит `item-click` и `navigate` с адресом из `to`. Текущая страница — последняя крошка.',
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const nav = canvas.getByRole('navigation', { name: 'Хлебные крошки' })
		await expect(within(nav).getByText('Ультрабук 13"').closest('[aria-current="page"]')).not.toBeNull()

		const catalog = canvas.getByRole('link', { name: 'Каталог' })
		await expect(catalog).toHaveAttribute('href', '/catalog')
		await userEvent.click(catalog)
		await expect(args['onItem-click']).toHaveBeenCalledWith(ITEMS[1])
		await expect(args.onNavigate).toHaveBeenCalledWith('/catalog')
	},
}
