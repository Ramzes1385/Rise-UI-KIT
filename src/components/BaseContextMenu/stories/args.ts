import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseContextMenu from '../ui/BaseContextMenu.vue'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'

const EPISODE_ACTIONS: DropdownMenuItem[][] = [
	[
		{ label: 'Открыть', icon: 'play' },
		{ label: 'Копировать ссылку', icon: 'link', shortcut: 'Ctrl+L' },
		{ label: 'Переместить', icon: 'folder', children: [{ label: 'Сезон 1' }, { label: 'Сезон 2' }, { label: 'Архив' }] },
	],
	[{ label: 'Удалить', icon: 'trash', isDanger: true }],
]

export const args = {
	items: EPISODE_ACTIONS,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	onSelect: fn(),
} satisfies Meta<typeof BaseContextMenu>['args']
