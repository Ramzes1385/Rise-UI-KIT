import { DEMO_TRACKS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { expect, waitFor, within } from 'storybook/test'

export const Subtitles: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Субтитры из `tracks`: WebVTT и SubRip (.srt) без перекодирования, в UTF-8, UTF-16 или Windows-1251.',
					'Дорожка выбирается в меню кнопки «Субтитры», клавиша C включает и выключает; `v-model:text-track` — выбранная дорожка.',
					'Блок субтитров перетаскивается мышью в любое место кадра; размер, цвет, фон и положение — в «Вид субтитров».',
					'Оформление и место запоминаются в браузере для всех записей. Свой файл .srt или .vtt зритель добавляет пунктом',
					'«Загрузить файл субтитров…» или перетаскиванием на плеер; `hasCaptionUpload: false` это отключает.',
					'Файлы с другого домена загружаются по CORS, как и запись с `crossorigin`.',
				].join('\n'),
			},
		},
	},
	args: { tracks: DEMO_TRACKS },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = canvasElement.querySelector('.base-media-player') as HTMLElement
		const captions = (): string => player.querySelector('.base-media-player__captions')?.textContent?.trim() ?? ''
		await waitFor(() => expect(captions()).toContain('Демонстрационная запись'))

		const button = canvas.getByRole('button', { name: 'Субтитры' })
		await userEvent.click(button)
		await userEvent.click(await within(player).findByRole('menuitemradio', { name: 'English' }))
		await waitFor(() => expect(captions()).toContain('Rise UI Kit demo recording'))

		await userEvent.keyboard('c')
		await waitFor(() => expect(captions()).toBe(''))
		await expect(button).not.toHaveClass('base-media-player__control--active')
		await userEvent.keyboard('c')
		await waitFor(() => expect(captions()).toContain('Rise UI Kit demo recording'))
	},
}
