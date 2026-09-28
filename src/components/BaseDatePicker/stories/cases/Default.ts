import type meta from '../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: выберите дату в панели или меняйте props в Controls — значение синхронизировано с args (v-model).',
					'Без play-функции: story открывают e2e-тесты, и автоматические клики мешали бы им (сценарий проверяет Keyboard).',
				].join('\n'),
			},
		},
	},
}
