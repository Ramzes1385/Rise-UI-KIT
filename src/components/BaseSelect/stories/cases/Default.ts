import type meta from '../BaseSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: выберите город или меняйте props в Controls — значение синхронизировано.',
					'Без play-функции: story открывают e2e-тесты (сценарий с клавиатурой проверяет Keyboard).',
				].join('\n'),
			},
		},
	},
}
