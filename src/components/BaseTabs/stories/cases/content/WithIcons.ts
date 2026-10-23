import type meta from '../../BaseTabs.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TabItem } from '../../../types/BaseTabs.types'

const ICON_TABS: TabItem[] = [
	{ id: 'home', label: 'Главная', icon: 'home' },
	{ id: 'settings', label: 'Настройки', icon: 'settings' },
	{ id: 'notifications', label: 'Уведомления', icon: 'bell' },
]

export const WithIcons: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Значок вкладки — `icon` с именем иконки BaseIcon. Значок декоративный: имя вкладки — только `label`.',
					'Своя разметка значка — слот `icon` (история IconSlot).',
				].join('\n'),
			},
		},
	},
	args: { items: ICON_TABS, modelValue: 'home', variant: 'pills' },
	play: async ({ canvas }) => {
		const settings = canvas.getByRole('tab', { name: 'Настройки' })
		const icon = settings.querySelector('.base-tabs__icon')
		await expect(icon).toHaveAttribute('aria-hidden', 'true')
		await expect(within(settings).queryByRole('img')).not.toBeInTheDocument()
	},
}
