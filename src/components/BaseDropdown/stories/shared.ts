import type { BaseMenuItem } from '@components/BaseMenu'

export const FILE_ACTIONS: BaseMenuItem[][] = [
	[
		{ label: 'Скопировать ссылку', icon: 'link' },
		{ label: 'Скачать', icon: 'download' },
		{ label: 'Удалить', icon: 'trash' },
	],
]

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
