import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { expect, waitFor, within } from 'storybook/test'
import { DEMO_QUALITIES, storyVideo } from '../../shared'

export const Quality: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Несколько разрешений одного видео — список `sources` с `label` («720p») или `height`. В меню «Качество» — «Авто»',
					'и разрешения от лучшего к худшему. «Авто» берёт наименьшее, которого хватает на высоту плеера с учётом плотности',
					'пикселей экрана, и только повышает качество — например, при переходе в полноэкранный режим.',
					'Смена качества продолжает с той же секунды, с той же скоростью и не снимает с паузы, если видео стояло;',
					'выбор сохраняется для следующих серий с такими же подписями. У HLS-потока меню строится по уровням потока.',
				].join('\n'),
			},
		},
	},
	args: { sources: DEMO_QUALITIES },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		const video = storyVideo(canvasElement)
		await waitFor(() => expect(video.readyState).toBeGreaterThan(0))
		video.currentTime = 3
		video.playbackRate = 1.5
		await waitFor(() => expect(video.seeking).toBe(false))

		const button = canvas.getByRole('button', { name: 'Качество' })
		await userEvent.click(button)
		const options = await player.findAllByRole('menuitemradio')
		await expect(options.map(option => option.textContent?.trim())).toEqual(['Авто (270p)', '270p', '144p'])
		await expect(options[0]).toHaveAttribute('aria-checked', 'true')

		await userEvent.click(options[2])
		await waitFor(() => expect(video.currentSrc).toContain('demo-144'))
		await waitFor(() => expect(video.readyState).toBeGreaterThan(0))
		await waitFor(() => expect(Math.round(video.currentTime)).toBe(3))
		await expect(video.playbackRate).toBe(1.5)
		await expect(video.paused).toBe(true)
		await expect(button).toHaveTextContent('144p')
	},
}
