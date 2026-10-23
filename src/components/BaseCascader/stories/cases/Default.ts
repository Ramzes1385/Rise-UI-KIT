import type meta from '../BaseCascader.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: выберите округ и район или меняйте props в Controls — путь синхронизирован с `modelValue`.',
					'Без play-функции: сценарий с клавиатурой — в Keyboard.',
				].join('\n'),
			},
		},
	},
}
