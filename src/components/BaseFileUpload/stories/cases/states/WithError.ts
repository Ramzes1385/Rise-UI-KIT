import { waitFor, expect } from 'storybook/test'
import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Ошибка: рамка зоны цвета ошибки, текст под ней; зона описана текстом ошибки (`aria-describedby`).' },
		},
	},
	args: { error: 'Прикрепите хотя бы один документ' },
	play: async ({ canvas }) => {
		await waitFor(() => expect(canvas.getByText('Прикрепите хотя бы один документ')).toBeVisible())
		await expect(canvas.getByRole('button', { name: /Выберите файлы/ })).toHaveAccessibleDescription('Прикрепите хотя бы один документ')
	},
}
