import { STORY_USERS } from '@/stories/helpers'
import type { BaseListProps, ListItem, ListMove } from '../types/BaseList.types'

export type ListStoryArgs = BaseListProps & {
	onMove?: (move: ListMove) => void
	onActivate?: (item: ListItem) => void
	item?: string
	prefix?: string
	actions?: string
	empty?: string
}

export const SECTIONS: ListItem[] = [
	{ id: 'inbox', title: 'Входящие', description: 'Новые письма и заявки', icon: 'inbox', meta: '12' },
	{ id: 'calendar', title: 'Календарь', description: 'Встречи на неделю', icon: 'calendar' },
	{ id: 'files', title: 'Файлы', description: 'Документы команды', icon: 'folder' },
	{ id: 'settings', title: 'Настройки', icon: 'settings', isDisabled: true },
]

export const TASKS: ListItem[] = [
	{ id: 'design', title: 'Макет главной', description: 'Дизайн', icon: 'image' },
	{ id: 'api', title: 'Метод выгрузки', description: 'Бэкенд', icon: 'code' },
	{ id: 'tests', title: 'Тесты оплаты', description: 'Качество', icon: 'check' },
	{ id: 'release', title: 'Выпуск 2.0', description: 'Релиз', icon: 'calendar' },
]

export const PEOPLE: ListItem[] = STORY_USERS.map(user => ({
	id: `user-${user.id}`,
	title: user.name,
	description: user.role,
	avatar: user.avatar,
	meta: user.email,
}))

export const listTitles = (canvasElement: HTMLElement): string[] =>
	[...canvasElement.querySelectorAll('[data-list-id] .base-list__title')].map(element => element.textContent ?? '')
