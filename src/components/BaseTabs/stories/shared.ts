import type { TabItem } from '../types/BaseTabs.types'

export const TABS: TabItem[] = [
	{ id: 'overview', label: 'Обзор' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы' },
	{ id: 'delivery', label: 'Доставка' },
]

export const TABS_WITH_DISABLED: TabItem[] = [
	{ id: 'overview', label: 'Обзор' },
	{ id: 'specs', label: 'Характеристики' },
	{ id: 'reviews', label: 'Отзывы' },
	{ id: 'delivery', label: 'Доставка', isDisabled: true },
]

export const MODEL_KEYS = ['modelValue', 'onUpdate:modelValue']
