import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинный текст переносится по словам: ширина уведомления не больше 360px, кнопка закрытия остаётся справа.',
			},
		},
	},
	args: {
		type: 'warning',
		title: 'Серия отправлена на согласование с замечаниями по синхронизации',
		description:
			'В репликах 12–15 и 40–44 голос опережает видео на 0,3–0,5 секунды. Согласование продолжится, но перед публикацией ' +
			'эти фрагменты нужно перезаписать или сдвинуть в таймлайне.',
	},
	play: async ({ canvas }) => {
		const item = await canvas.findByRole('status')
		await expect(item.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		const close = within(item).getByRole('button', { name: 'Закрыть' })
		await expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(item.getBoundingClientRect().right)
	},
}
