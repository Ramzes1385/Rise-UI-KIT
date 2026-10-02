import { expect } from 'storybook/test'
import type meta from '../../BaseMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseMenuItem } from '../../../types/BaseMenu.types'

const LINK_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Профиль', icon: 'link', href: '#profile' },
		{ label: 'Настройки', icon: 'settings', href: '#settings' },
		{ label: 'Архив', icon: 'inbox', href: '#archive', isDisabled: true },
	],
	[{ label: 'Выйти', icon: 'arrow-right' }],
]

export const Links: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Пункты-ссылки: `to` (маршрут приложения, RouterLink при подключённом роутере) или `href` — пункт рендерится',
					'ссылкой `BaseLink`: Enter открывает адрес, средний клик и «Открыть в новой вкладке» работают как у ссылки.',
					'Клик по ссылке тоже эмитит `select`. Отключённая ссылка — без адреса. Пункт без адреса остаётся кнопкой.',
				].join('\n'),
			},
		},
	},
	args: { items: LINK_ITEMS },
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('link', { name: 'Профиль' })).toHaveAttribute('href', '#profile')
		await expect(canvas.getByText('Архив').closest('.base-menu__item')).not.toHaveAttribute('href')
		await expect(canvas.getByRole('button', { name: 'Выйти' })).toBeVisible()

		await userEvent.tab()
		await expect(canvas.getByRole('link', { name: 'Профиль' })).toHaveFocus()
		await userEvent.tab()
		await expect(canvas.getByRole('link', { name: 'Настройки' })).toHaveFocus()
	},
}
