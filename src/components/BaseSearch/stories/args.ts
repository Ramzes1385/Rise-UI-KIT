import { fn } from 'storybook/test'
import type { SearchArgs } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type { SearchResult } from '../types/BaseSearch.types'

const FILES: SearchResult[] = [
	{ id: 1, title: 'Закат в горах', description: 'Документальный фильм · 52 мин', icon: 'video', category: 'Видео' },
	{ id: 2, title: 'Запись голоса — сцена 12', description: 'WAV · 3 мин 40 с', icon: 'mic', category: 'Аудио' },
	{ id: 3, title: 'Сценарий «Лисья тропа»', description: 'Серия 3 · 24 страницы', icon: 'file', category: 'Документ' },
	{ id: 4, title: 'Раскадровка «Лисья тропа»', description: 'PNG · 18 кадров', icon: 'image', category: 'Изображение' },
	{ id: 5, title: 'Субтитры «Северный ветер»', description: 'SRT · серия 1', icon: 'file', category: 'Документ' },
	{ id: 6, title: 'Архив озвучки 2024', description: '128 файлов', icon: 'folder', category: 'Папка' },
	{ id: 7, title: 'Календарь записей', description: 'Май 2025', icon: 'calendar', category: 'План' },
]

export const args = {
	modelValue: '',
	results: FILES,
	placeholder: 'Поиск по проекту',
	variant: 'default',
	mode: 'default',
	sizeScale: 100,
	maxResults: 10,
	hasIcon: true,
	hasClear: true,
	isInstant: true,
	isRemote: false,
	debounceMs: 300,
	isAutofocus: false,
	isLoading: false,
	isDisabled: false,
	'onUpdate:modelValue': fn(),
	onSearch: fn(),
	onSelect: fn(),
	onClear: fn(),
} satisfies Meta<SearchArgs>['args']
