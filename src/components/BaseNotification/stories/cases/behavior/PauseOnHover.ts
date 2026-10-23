import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'

export const PauseOnHover: StoryObj<typeof meta> = {
	args: { type: 'success', title: 'Ссылка скопирована', description: 'Отправьте её участникам проекта.', duration: 2000 },
	parameters: {
		docs: {
			description: {
				story: [
					'Пауза: пока указатель над уведомлениями или фокус на их кнопках, автозакрытие стоит и полоса прогресса',
					'замирает — есть время дочитать и нажать действие (WCAG 2.2.1). Здесь `duration` — 2 секунды.',
				].join('\n'),
			},
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	play: async ({ canvas, userEvent, args }) => {
		const item = await canvas.findByRole('status')
		await userEvent.hover(item)
		await new Promise(resolve => setTimeout(resolve, 2500))
		await expect(item).toBeInTheDocument()
		await expect(
			getComputedStyle(item.querySelector('.base-notification-item__progress .base-progress__fill') as HTMLElement)
				.animationPlayState,
		).toBe('paused')

		await userEvent.unhover(item)
		await waitFor(() => expect(canvas.queryByRole('status')).not.toBeInTheDocument(), { timeout: 4000 })
		await expect(args.onClose).toHaveBeenCalledOnce()
	},
}
