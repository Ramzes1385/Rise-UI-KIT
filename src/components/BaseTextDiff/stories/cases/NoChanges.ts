import { expect } from 'storybook/test'
import { SHORT_BEFORE } from '../shared'
import type meta from '../BaseTextDiff.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const NoChanges: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Одинаковые тексты: строки без подсветки и «Изменений нет» в сводке.' } } },
	args: { before: SHORT_BEFORE, after: SHORT_BEFORE, label: 'Карточка товара' },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Изменений нет')).toBeVisible()
		await expect(canvas.getByText('Карточка товара: добавлено строк — 0, удалено — 0')).toBeInTheDocument()
	},
}
