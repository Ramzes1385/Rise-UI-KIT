import { storyVideo } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const Autoplay: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`isAutoplay` запускает запись без звука: со звуком браузеры автозапуск не разрешают. Если браузер откажет и так,',
					'на кадре останется большая кнопка «Воспроизвести» с подсказкой, а плеер сообщит `error` с кодом `autoplay-blocked`.',
				].join('\n'),
			},
		},
	},
	args: { isAutoplay: true, isLoop: true },
	play: async ({ canvasElement }) => {
		const video = storyVideo(canvasElement)
		await waitFor(() => expect(video.paused).toBe(false), { timeout: STORY_WAIT_TIMEOUT })
		await expect(video.muted).toBe(true)
		video.pause()
	},
}
