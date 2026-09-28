import { docsFrame } from '../shared'
import type { SearchArgs } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'

export const Empty: StoryObj<SearchArgs> = {
	args: { modelValue: 'Трейлер' },
	parameters: {
		docs: {
			...docsFrame(200),
			description: {
				story: [
					'Ничего не найдено: в панели — текст из слота `empty` (по умолчанию «Ничего не найдено»). Скринридер слышит то же',
					'из скрытой области `role="status"`.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		const empty = await screen.findByText('Ничего не найдено', { ignore: 'script, style, [role="status"]' })
		await waitFor(() => expect(empty).toBeVisible())
		await expect(canvas.getByRole('status')).toHaveTextContent('Ничего не найдено')
	},
}
