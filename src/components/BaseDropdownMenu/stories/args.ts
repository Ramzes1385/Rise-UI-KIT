import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'
import type { DropdownMenuItem } from '../types/BaseDropdownMenu.types'

const EPISODE_ACTIONS: DropdownMenuItem[][] = [
	[
		{ label: 'Переименовать', icon: 'code', shortcut: 'F2' },
		{ label: 'Дублировать', icon: 'copy', shortcut: 'Ctrl+D' },
		{ label: 'Закрепить', icon: 'pin' },
	],
	[
		{
			label: 'Скачать',
			icon: 'download',
			children: [{ label: 'Видео MP4' }, { label: 'Субтитры SRT' }, { label: 'Звуковая дорожка WAV' }],
		},
		{ label: 'Открыть на сайте', icon: 'link', href: 'https://example.com/episodes/3', target: '_blank' },
	],
	[{ label: 'Удалить серию', icon: 'trash', isDanger: true }],
]

export const args = {
	items: EPISODE_ACTIONS,
	position: 'bottom-start',
	variant: 'default',
	sizeScale: 100,
	onSelect: fn(),
	onClose: fn(),
} satisfies Meta<typeof BaseDropdownMenu>['args']
