import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: меняйте props в панели Controls. Запись — локальный ролик WebM (VP9 и Opus) на 12 секунд.',
					'Проверка: Tab до перемотки, → сдвигает позицию на `seekStep`, M выключает и включает звук.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const seek = canvas.getByRole('slider', { name: 'Перемотка' })
		await waitFor(() => expect(seek).toHaveAttribute('aria-valuetext', '0:00 из 0:12'))

		await tabTo(seek, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(seek).toHaveAttribute('aria-valuetext', '0:05 из 0:12'))

		await userEvent.keyboard('m')
		await expect(canvas.getByRole('button', { name: 'Включить звук' })).toBeInTheDocument()
		await userEvent.keyboard('m')
		await expect(canvas.getByRole('button', { name: 'Выключить звук' })).toBeInTheDocument()
	},
}
