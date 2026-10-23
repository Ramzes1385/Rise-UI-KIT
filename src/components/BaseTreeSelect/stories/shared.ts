import type { TreeNode } from '@components/BaseTree/types/BaseTree.types'

export const STORY_REGIONS: TreeNode[] = [
	{
		id: 'center',
		label: 'Центральный округ',
		children: [
			{ id: 'moscow', label: 'Москва' },
			{
				id: 'moscow-region',
				label: 'Московская область',
				children: [
					{ id: 'khimki', label: 'Химки' },
					{ id: 'podolsk', label: 'Подольск' },
					{ id: 'kolomna', label: 'Коломна' },
				],
			},
			{ id: 'tula', label: 'Тула' },
		],
	},
	{
		id: 'north-west',
		label: 'Северо-Западный округ',
		children: [
			{ id: 'spb', label: 'Санкт-Петербург' },
			{ id: 'kaliningrad', label: 'Калининград' },
			{ id: 'murmansk', label: 'Мурманск', isDisabled: true },
		],
	},
	{
		id: 'volga',
		label: 'Приволжский округ',
		children: [
			{ id: 'kazan', label: 'Казань' },
			{ id: 'samara', label: 'Самара' },
			{ id: 'volgograd', label: 'Волгоград' },
		],
	},
]

export const STORY_LONG_ITEMS: TreeNode[] = [
	{
		id: 'catalog',
		label: 'Каталог товаров для дома, сада и дачи — сезонное предложение с доставкой по всей стране',
		children: [
			{ id: 'garden', label: 'Садовая техника: газонокосилки, триммеры, культиваторы и запасные части к ним' },
			{ id: 'furniture', label: 'Мебель для веранды и террасы из массива сосны с пропиткой от влаги' },
			{ id: 'lights', label: 'Уличное освещение на солнечных батареях' },
			{ id: 'tools', label: 'Ручной инструмент' },
			{ id: 'seeds', label: 'Семена и рассада' },
		],
	},
]

export function docsFrame(height: number) {
	return { story: { inline: false, height: `${height}px` } }
}
