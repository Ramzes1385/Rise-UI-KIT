import type { BaseMenuItem } from '../types/BaseMenu.types'

export const ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Открыть', icon: 'eye-open-icon' },
		{ label: 'Скачать', icon: 'download' },
		{ label: 'Копировать ссылку', icon: 'link' },
	],
	[
		{ label: 'Переименовать', icon: 'file' },
		{ label: 'Переместить', icon: 'folder' },
	],
	[{ label: 'Удалить', icon: 'trash' }],
]

export const SHORT_ITEMS: BaseMenuItem[][] = [
	[
		{ label: 'Открыть', icon: 'eye-open-icon' },
		{ label: 'Скачать', icon: 'download' },
		{ label: 'Удалить', icon: 'trash' },
	],
]
