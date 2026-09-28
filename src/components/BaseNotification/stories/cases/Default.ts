import type meta from '../BaseNotification.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: уведомление из props. Здесь `duration` — 10 минут, чтобы уведомление не исчезало, и `isContained`,',
					'чтобы оно было в потоке страницы. Без play-функции: story открывают e2e-тесты.',
				].join('\n'),
			},
		},
	},
}
