import { expect } from 'storybook/test'
import type meta from '../BaseNotification.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Persistent: StoryObj<typeof meta> = {
	args: {
		type: 'warning',
		title: 'Нет подключения к интернету',
		description: 'Изменения сохранятся на устройстве и отправятся, когда связь восстановится.',
		isPersistent: true,
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Без автозакрытия: `isPersistent` — для состояния, которое длится (загрузка, нет сети). Полосы прогресса нет,',
					'уведомление закрывает пользователь или код (`remove`, `update` с `isPersistent: false`).',
				].join('\n'),
			},
		},
		controls: { include: ['isPersistent', 'variant', 'sizeScale'] },
	},
	play: async ({ canvas }) => {
		const item = await canvas.findByRole('status')
		await expect(item.querySelector('.base-notification-item__progress')).toBeNull()
	},
}
