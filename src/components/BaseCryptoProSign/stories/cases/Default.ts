import { expect } from 'storybook/test'
import type meta from '../BaseCryptoProSign.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Песочница: меняйте props в панели Controls. Элемент достижим клавишей Tab и срабатывает по Enter.' },
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('region', { name: 'Электронная подпись' })).toBeInTheDocument()
	},
}
