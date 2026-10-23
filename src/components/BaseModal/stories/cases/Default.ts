import type meta from '../BaseModal.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: кнопка открывает окно, `isOpen` синхронизирован с Controls. Окно закрывают «Закрыть» в шапке,',
					'Escape и клик по подложке; «Отмена» и «Удалить» в подвале закрывают его из кода примера.',
					'Без play-функции: story открывают e2e-тесты, и автоматические клики мешали бы им (сценарии проверяют Opened и Keyboard).',
				].join('\n'),
			},
		},
	},
}
