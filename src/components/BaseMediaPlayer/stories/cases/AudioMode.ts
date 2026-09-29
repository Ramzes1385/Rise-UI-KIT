import { DEMO_AUDIO_SOURCES } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const AudioMode: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Аудиорежим: для аудиофайла (`mode: "auto"` по MIME `audio/*` или расширению) плеер становится компактной',
					'панелью без кадра — без полного и широкого экрана, субтитров и жестов по кадру, панель не прячется.',
					'`mode="audio"` включает его и для видео (слушать без картинки), `mode="video"` — выключает.',
				].join('\n'),
			},
		},
	},
	args: { sources: DEMO_AUDIO_SOURCES, title: 'Подкаст «Интерфейсы», выпуск 12', poster: undefined },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvasElement.querySelector('.base-media-player')).toHaveClass('base-media-player--audio')
		await expect(canvas.queryByRole('button', { name: 'Во весь экран' })).not.toBeInTheDocument()
		await userEvent.click(canvas.getByRole('button', { name: 'Воспроизвести' }))
		const media = canvasElement.querySelector('video') as HTMLVideoElement
		await waitFor(() => expect(media.paused).toBe(false))
		media.pause()
		media.currentTime = 0
	},
}
