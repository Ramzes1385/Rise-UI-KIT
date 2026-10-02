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
