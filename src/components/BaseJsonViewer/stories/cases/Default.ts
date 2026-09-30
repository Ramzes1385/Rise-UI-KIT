import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseJsonViewer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: меняйте данные и props в панели Controls. Верхний уровень раскрыт (`expandDepth: 1`). В дереве одна',
					'точка Tab: стрелки вверх и вниз — по узлам, вправо — раскрыть и войти, влево — свернуть или выйти к родителю.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const first = canvas.getByRole('treeitem', { name: 'id: 1052' })
		await tabTo(first, userEvent)
		await expect(first).toHaveFocus()
		const customer = canvas.getByRole('treeitem', { name: 'customer: 3 ключа' })
		for (let step = 0; step < 5; step++) await userEvent.keyboard('{ArrowDown}')
		await expect(customer).toHaveFocus()
		await expect(customer).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{ArrowLeft}')
		await expect(customer).toHaveAttribute('aria-expanded', 'false')
		await userEvent.keyboard('{ArrowRight}')
		await expect(customer).toHaveAttribute('aria-expanded', 'true')
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(canvas.getByRole('treeitem', { name: 'name: "Павел Никитин"' })).toHaveFocus())
	},
}
