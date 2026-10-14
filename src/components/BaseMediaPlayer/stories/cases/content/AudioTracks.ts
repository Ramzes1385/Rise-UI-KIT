import { tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { expect, waitFor, within } from 'storybook/test'
import { DEMO_AUDIO_TRACKS, storyVideo } from '../../shared'

export const AudioTracks: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Озвучки отдельными аудиофайлами (`audioTracks`): звучат синхронно с видео, переключаются кнопкой «Озвучка» с той же',
					'позиции без перезагрузки видео. На кнопке — только значок, выбранная озвучка — в подсказке. Пункт без `src` — звук самого видео. Громкость и кнопка звука управляют выбранной',
					'озвучкой; `v-model:audio-track` — выбранная озвучка. Расхождение больше 0,3 с исправляется само.',
					'Файл с несколькими дорожками (MP4, MKV) без списка: меню показывает дорожки, если их видит браузер (Safari);',
					'для остальных браузеров дорожки выносятся в отдельные файлы — рецепт ffmpeg в docs/reference/COMPONENTS.md, раздел BaseMediaPlayer.',
				].join('\n'),
			},
		},
	},
	args: { audioTracks: DEMO_AUDIO_TRACKS },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		const audio = canvasElement.querySelector('audio') as HTMLAudioElement
		await waitFor(() => expect(audio.getAttribute('src')).toContain('demo-dub-a'))
		await expect(storyVideo(canvasElement).muted).toBe(true)

		const dub = canvas.getByRole('button', { name: 'Озвучка' })
		await tabTo(dub, userEvent)
		await expect(await player.findByRole('tooltip')).toHaveTextContent('Озвучка: Озвучка A (330 Гц)')
		await userEvent.click(dub)
		await userEvent.click(await player.findByRole('menuitemradio', { name: 'Оригинал' }))
		await waitFor(() => expect(audio.hasAttribute('src')).toBe(false))
		await expect(storyVideo(canvasElement).muted).toBe(false)
	},
}
