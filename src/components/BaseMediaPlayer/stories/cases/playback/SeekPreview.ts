import { demoThumbnails } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { expect, fireEvent, waitFor } from 'storybook/test'

export const SeekPreview: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Превью над шкалой при наведении: кадр 160×90, название главы и время; окно не выходит за плеер. С `thumbnails` кадры',
					'берутся из файла WebVTT со спрайтом (`sprite.jpg#xywh=0,0,160,90`) — так же работают Video.js и JW Player. Без файла',
					'плеер сам берёт кадры из записи: скрытое видео перематывается к позиции под указателем, кадр рисуется только после',
					'перемотки (`seeked`), кадры запоминаются; для HLS нужен `hls`. `:has-seek-preview="false"` отключает кадры из записи.',
				].join('\n'),
			},
		},
	},
	args: { thumbnails: demoThumbnails() },
	play: async ({ canvasElement }) => {
		const slider = canvasElement.querySelector('.base-media-player__seek') as HTMLElement
		await waitFor(() => expect(canvasElement.querySelector('[role="slider"]')).toHaveAttribute('aria-valuetext', '0:00 из 0:12'))
		const rect = slider.getBoundingClientRect()
		await fireEvent.pointerMove(slider, { clientX: rect.left + rect.width * 0.5, clientY: rect.top + rect.height / 2 })
		await waitFor(() => expect(canvasElement.querySelector('.base-media-player__preview-sprite')).not.toBeNull())
		await expect(canvasElement.querySelector('.base-media-player__preview-time')).toHaveTextContent('0:06')
	},
}
