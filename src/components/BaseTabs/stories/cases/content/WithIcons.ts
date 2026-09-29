import type meta from '../../BaseTabs.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TabItem } from '../../../types/BaseTabs.types'

const SVG_ATTRS =
	'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'

const ICON_TABS: TabItem[] = [
	{ id: 'profile', label: 'Профиль', icon: `<svg ${SVG_ATTRS}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>` },
	{
		id: 'security',
		label: 'Безопасность',
		icon: `<svg ${SVG_ATTRS}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
	},
	{
		id: 'notifications',
		label: 'Уведомления',
		icon: `<svg ${SVG_ATTRS}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21h4"/></svg>`,
	},
]

export const WithIcons: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Иконка вкладки — поле `icon` с доверенной SVG-разметкой (выводится через v-html, не передавайте данные пользователей).',
			},
		},
	},
	args: { items: ICON_TABS, modelValue: 'profile', variant: 'pills' },
}
