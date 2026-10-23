import { expect } from 'storybook/test'
import type meta from '../BaseTextDiff.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Split: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`mode: split` — «было» слева, «стало» справа: строки без изменений — напротив друг друга, удалённая строка',
					'без пары — пустая клетка справа, добавленная — слева. Заголовки колонок — `beforeLabel` и `afterLabel`.',
				].join('\n'),
			},
		},
	},
	args: { mode: 'split', beforeLabel: 'Редакция от 1 сентября', afterLabel: 'Редакция от 30 сентября' },
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('columnheader', { name: 'Редакция от 1 сентября' })).toBeVisible()
		await expect(canvasElement.querySelectorAll('tbody tr')).toHaveLength(5)
		await expect(canvasElement.querySelectorAll('.base-text-diff__cell--empty')).toHaveLength(4)
	},
}
