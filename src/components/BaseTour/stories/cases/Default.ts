import type meta from '../BaseTour.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: кнопка запускает тур по панели инструментов; «Далее» переходит к следующему шагу, Escape и клик',
					'по подложке пропускают тур (события `skip` и `close`). Сценарий с клавиатуры проверяет story Keyboard.',
				].join('\n'),
			},
		},
	},
}
