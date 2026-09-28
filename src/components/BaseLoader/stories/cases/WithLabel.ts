import { expect } from 'storybook/test'
import type meta from '../BaseLoader.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithLabel: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Подпись под индикатором (`hasLabel`). Текст `label` — и подпись, и доступное имя статуса.' } },
	},
	args: { hasLabel: true, label: 'Сохранение…' },
	play: async ({ canvas }) => {
		const status = canvas.getByRole('status', { name: 'Сохранение' })
		await expect(status).toHaveTextContent('Сохранение…')
	},
}
