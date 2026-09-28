import { expect } from 'storybook/test'
import type meta from '../BaseSideBar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: текущая страница «Товары» (`activePath`), её раздел «Каталог» раскрыт и выделен; «Настройки» — группа,',
					'раскрывающаяся по клику. Кнопка в шапке сворачивает панель.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: /Товары/ })).toHaveAttribute('aria-current', 'page')
		await expect(canvas.getByRole('button', { name: 'Настройки' })).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.getByRole('button', { name: 'Недоступно' })).toBeDisabled()
	},
}
