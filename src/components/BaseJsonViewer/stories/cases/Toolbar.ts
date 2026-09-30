import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseJsonViewer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Toolbar: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель над деревом: «Развернуть всё», «Свернуть всё» и «Копировать JSON» — текст с отступом в два пробела,',
					'событие `copy`; результат копирования объявляется через `role="status"`.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Развернуть всё' }))
		await expect(canvas.getByRole('treeitem', { name: 'sku: "SOCK-3"' })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть всё' }))
		await expect(canvas.getByRole('treeitem', { name: 'items: 2 элемента' })).toHaveAttribute('aria-expanded', 'false')
		await userEvent.click(canvas.getByRole('button', { name: 'Копировать JSON' }))
		await waitFor(() => expect(canvas.getByRole('status')).not.toBeEmptyDOMElement())
		if (canvas.getByRole('status').textContent === 'JSON скопирован') await expect(args.onCopy).toHaveBeenCalledOnce()
	},
}
