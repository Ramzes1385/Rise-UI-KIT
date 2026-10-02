import type { Meta } from '@storybook/vue3-vite'
import type { BaseListProps } from '../types/BaseList.types'

export const args = {
	items: [
		{ id: 'inbox', title: 'Входящие', description: 'Новые письма и заявки', icon: 'inbox', meta: '12' },
		{ id: 'calendar', title: 'Календарь', description: 'Встречи на неделю', icon: 'calendar' },
		{ id: 'files', title: 'Файлы', description: 'Документы команды', icon: 'folder' },
		{ id: 'settings', title: 'Настройки', icon: 'settings', isDisabled: true },
	],
	modelValue: null,
	selectionMode: 'single',
	isSortable: false,
	label: 'Разделы',
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<BaseListProps>['args']
