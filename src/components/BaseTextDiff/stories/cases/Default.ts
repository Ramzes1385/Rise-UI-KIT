import { expect } from 'storybook/test'
import type meta from '../BaseTextDiff.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: меняйте тексты и вид в панели Controls. Изменённые слова в паре строк выделены отдельно.',
			},
		},
	},
	play: async ({ canvas, canvasElement }) => {
		await expect(canvas.getByRole('figure', { name: 'Договор, раздел 4' })).toBeVisible()
		await expect(canvas.getByText('Договор, раздел 4: добавлено строк — 3, удалено — 3')).toBeInTheDocument()
		const inserted = [...canvasElement.querySelectorAll('ins')].map(node => node.textContent)
		await expect(inserted).toEqual(['5', '30%', '70%'])
	},
}
