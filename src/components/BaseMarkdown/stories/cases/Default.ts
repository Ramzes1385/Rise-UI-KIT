import { expect } from 'storybook/test'
import type meta from '../BaseMarkdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Отчёт в Markdown: заголовки, выделение, вложенный список, задачи, цитата, блок кода, таблица, ссылки.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('heading', { level: 2, name: 'Отчёт о выпуске' })).toBeVisible()
		await expect(canvas.getByRole('link', { name: 'журнале изменений' })).toHaveAttribute('rel', 'noopener noreferrer')
		await expect(canvas.getByRole('table')).toBeVisible()
		await expect(canvas.getAllByRole('img', { name: 'Выполнено' })).toHaveLength(2)
		const code = canvas.getByText((_, element) => element?.tagName === 'CODE' && /const answer/.test(element.textContent ?? ''))
		await expect(code.closest('pre')).not.toBeNull()
		await userEvent.tab()
		await expect(canvas.getByRole('link', { name: 'журнале изменений' })).toHaveFocus()
	},
}
