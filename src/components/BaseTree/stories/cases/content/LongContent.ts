import { expect } from 'storybook/test'
import { nodeLabel } from '../../shared'
import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../../types/BaseTree.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const DEEP: TreeNode[] = [
	{
		id: 'l1',
		label: 'Годовой отчёт о финансово-хозяйственной деятельности за 2024 год',
		icon: 'folder',
		children: [
			{
				id: 'l2',
				label: 'Приложения к отчёту',
				icon: 'folder',
				children: [
					{
						id: 'l3',
						label: 'Бухгалтерская отчётность',
						icon: 'folder',
						children: [
							{
								id: 'l4',
								label: 'Пояснения к бухгалтерскому балансу и отчёту о финансовых результатах.xlsx',
								icon: 'file',
							},
						],
					},
				],
			},
		],
	},
]

const template = `
	<div style="width: 300px;"><BaseTree v-bind="args" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные метки обрезаются многоточием в одну строку, глубокая вложенность сдвигает узлы на 20px за уровень.',
			},
			source: storySource({ template, imports: ['BaseTree'] }),
		},
	},
	args: { items: DEEP, isDefaultExpandAll: true, expandedIds: undefined },
	render: args => ({
		components: { BaseTree },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const label = nodeLabel(canvasElement, 'Пояснения к бухгалтерскому балансу и отчёту о финансовых результатах.xlsx')
		await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
	},
}
