import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseTree.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type { TreeNode } from '../../../types/BaseTree.types'

const STAFF: TreeNode[] = Array.from({ length: 60 }, (_, department) => ({
	id: `department-${department + 1}`,
	label: `Отдел ${department + 1}`,
	icon: 'folder',
	children: Array.from({ length: 80 }, (_, person) => ({
		id: `person-${department + 1}-${person + 1}`,
		label: `Сотрудник ${department + 1}.${person + 1}`,
	})),
}))

export const Virtual: StoryObj<typeof meta> = {
	args: { items: STAFF, isVirtual: true, height: 320, isDefaultExpandAll: true, expandedIds: undefined, ariaLabel: 'Сотрудники' },
	parameters: {
		docs: {
			description: {
				story: [
					'Виртуальная прокрутка (`isVirtual` и `height`): дерево — плоский список видимых узлов, в DOM только видимые и запас.',
					'Уровень и позиция объявляются через `aria-level`, `aria-setsize`, `aria-posinset`; узел в порядке Tab остаётся',
					'в DOM, а стрелки и Home/End к неотрисованному узлу сначала прокручивают к нему. Анимации раскрытия в этом режиме нет.',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale', 'height', 'itemSize'] },
	},
	play: async ({ canvas, userEvent }) => {
		const tree = canvas.getByRole('tree', { name: 'Сотрудники' })
		await expect(canvas.getAllByRole('treeitem').length).toBeLessThan(40)
		const first = canvas.getByRole('treeitem', { name: 'Отдел 1' })
		await tabTo(first, userEvent)
		await userEvent.keyboard('{End}')
		await waitFor(() => expect(canvas.getByRole('treeitem', { name: 'Сотрудник 60.80' })).toHaveFocus())
		await expect(tree.scrollTop).toBeGreaterThan(0)
		await userEvent.keyboard('{Home}')
		await waitFor(() => expect(canvas.getByRole('treeitem', { name: 'Отдел 1' })).toHaveFocus())
	},
}
