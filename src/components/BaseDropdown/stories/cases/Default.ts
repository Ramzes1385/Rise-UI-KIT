import type meta from '../BaseDropdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: меню действий. Триггер открывает и закрывает панель, выбор пункта закрывает её, `isOpen` виден в Controls.',
					'Без play-функции: story открывают e2e-тесты, и автоматические клики мешали бы им (сценарий проверяет Keyboard).',
				].join('\n'),
			},
		},
	},
}
