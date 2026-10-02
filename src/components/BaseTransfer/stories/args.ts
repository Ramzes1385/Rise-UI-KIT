import type { Meta } from '@storybook/vue3-vite'
import type { BaseTransferProps } from '../types/BaseTransfer.types'

export const args = {
	items: [
		{ id: 'anna', title: 'Анна Смирнова', description: 'Дизайн' },
		{ id: 'boris', title: 'Борис Орлов', description: 'Фронтенд' },
		{ id: 'vera', title: 'Вера Ким', description: 'Аналитика' },
		{ id: 'gleb', title: 'Глеб Петров', description: 'Бэкенд', isDisabled: true },
		{ id: 'darya', title: 'Дарья Волкова', description: 'Тестирование' },
		{ id: 'egor', title: 'Егор Белов', description: 'Мобильная разработка' },
	],
	modelValue: ['vera'],
	label: 'Участники проекта',
	isSearchable: false,
	isSortable: false,
	height: 240,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<BaseTransferProps>['args']
