import type { CommandItem } from '../types/BaseCommandPalette.types'

export const COMMANDS: CommandItem[] = [
	{ id: 'home', label: 'Главная', group: 'Навигация', icon: 'home', shortcut: 'g+h', keywords: ['дашборд'] },
	{ id: 'tasks', label: 'Задачи', group: 'Навигация', icon: 'list-bullet', description: 'Доска и список задач' },
	{ id: 'settings', label: 'Настройки', group: 'Навигация', icon: 'settings', shortcut: 'mod+,' },
	{ id: 'new', label: 'Новая задача', group: 'Действия', icon: 'plus', shortcut: 'mod+shift+n', keywords: ['создать'] },
	{ id: 'upload', label: 'Загрузить файл', group: 'Действия', icon: 'upload' },
	{
		id: 'export',
		label: 'Экспорт в CSV',
		group: 'Действия',
		icon: 'download',
		isDisabled: true,
		description: 'Нужны права администратора',
	},
	{ id: 'theme', label: 'Переключить тему', group: 'Вид', icon: 'moon', shortcut: 'mod+shift+l', keywords: ['тёмная', 'светлая'] },
	{ id: 'fullscreen', label: 'Во весь экран', group: 'Вид', icon: 'fullscreen' },
]
