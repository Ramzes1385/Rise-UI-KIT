import { docsFrame } from '../../shared'
import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor, within } from 'storybook/test'

export const Multiple: StoryObj<typeof meta> = {
	args: {
		label: 'Города',
		placeholder: 'Выберите города',
		isMultiple: true,
		isDefaultExpandAll: true,
		modelValue: ['moscow', 'khimki'],
	},
	parameters: {
		docs: {
			...docsFrame(460),
			description: {
				story: [
					'Несколько значений: флажки с каскадом. Ветка отмечает доступных потомков, часть выбранных детей —',
					'частичный выбор (`aria-checked="mixed"`); отключённый Мурманск в каскаде не участвует.',
					'Значение — по `checkedStrategy` (здесь `child`: только узлы без выбранных детей); крестик метки снимает выбор.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Города' })
		await userEvent.click(trigger)
		const tree = await screen.findByRole('tree', { name: 'Города' })
		await expect(tree).toHaveAttribute('aria-multiselectable', 'true')
		await expect(within(tree).getByRole('treeitem', { name: 'Центральный округ' })).toHaveAttribute('aria-checked', 'mixed')

		await userEvent.click(within(tree).getByRole('treeitem', { name: 'Северо-Западный округ' }))
		await waitFor(() => expect(within(trigger).getByText('Калининград')).toBeInTheDocument())
		await expect(within(tree).getByRole('treeitem', { name: 'Северо-Западный округ' })).toHaveAttribute('aria-checked', 'true')
		await expect(within(trigger).queryByText('Мурманск')).not.toBeInTheDocument()
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
	},
}
