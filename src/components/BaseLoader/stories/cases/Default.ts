import { expect } from 'storybook/test'
import type meta from '../BaseLoader.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: меняйте props в панели Controls. Доступное имя статуса — текст `label` без многоточия.' },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('status', { name: 'Загрузка' })).toBeVisible()
	},
}
