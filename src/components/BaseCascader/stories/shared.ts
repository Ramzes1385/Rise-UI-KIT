import type { BaseCascaderNode } from '../types/BaseCascader.types'

export const REGIONS: BaseCascaderNode[] = [
	{
		id: 'msk-region',
		label: 'Москва',
		children: [
			{
				id: 'cao',
				label: 'Центральный округ',
				children: [
					{ id: 'tverskoy', label: 'Тверской' },
					{ id: 'arbat', label: 'Арбат' },
					{ id: 'khamovniki', label: 'Хамовники' },
				],
			},
			{
				id: 'sao',
				label: 'Северный округ',
				children: [
					{ id: 'aeroport', label: 'Аэропорт' },
					{ id: 'sokol', label: 'Сокол', isDisabled: true },
				],
			},
		],
	},
	{
		id: 'spb-region',
		label: 'Санкт-Петербург',
		children: [
			{ id: 'admiralteysky', label: 'Адмиралтейский' },
			{ id: 'vasileostrovsky', label: 'Василеостровский' },
			{ id: 'petrogradsky', label: 'Петроградский' },
		],
	},
	{ id: 'kzn-region', label: 'Казань', children: [{ id: 'vakhitovsky', label: 'Вахитовский' }] },
	{ id: 'nsk-region', label: 'Новосибирск', isDisabled: true, children: [{ id: 'leninsky', label: 'Ленинский' }] },
]

export const LAZY_ROOTS: BaseCascaderNode[] = [
	{ id: 'ru', label: 'Россия' },
	{ id: 'kz', label: 'Казахстан' },
	{ id: 'by', label: 'Беларусь', description: 'Первая загрузка — с ошибкой' },
]

export const LAZY_LEVELS: Record<string, BaseCascaderNode[]> = {
	ru: [
		{ id: 'msk', label: 'Москва' },
		{ id: 'spb', label: 'Санкт-Петербург', isLeaf: true },
	],
	msk: [
		{ id: 'tverskoy', label: 'Тверской', isLeaf: true },
		{ id: 'arbat', label: 'Арбат', isLeaf: true },
	],
	kz: [{ id: 'almaty', label: 'Алматы', isLeaf: true }],
	by: [{ id: 'minsk', label: 'Минск', isLeaf: true }],
}

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
