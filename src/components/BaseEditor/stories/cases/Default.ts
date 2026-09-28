import { expect } from 'storybook/test'
import type meta from '../BaseEditor.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: печатайте в редакторе или меняйте props в Controls — HTML в `modelValue` синхронизирован',
					'(событие `update:modelValue` видно в панели Actions).',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await userEvent.type(textbox, ' Готово к ревью.')
		await expect(textbox).toHaveFocus()
		await expect(textbox).toHaveTextContent('отвечает. Готово к ревью.')
	},
}
