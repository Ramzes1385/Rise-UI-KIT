import { DEMO_TRACKS } from '../shared'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

export const Subtitles: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Субтитры из `tracks`: WebVTT и SubRip (.srt) без перекодирования, в UTF-8, UTF-16 или Windows-1251.',
					'Дорожка выбирается в «Настройках» или кнопкой «Субтитры» (клавиша C); `v-model:text-track` — выбранная дорожка.',
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

		await userEvent.click(canvas.getByRole('button', { name: 'Настройки' }))
		await userEvent.click(await within(player).findByRole('menuitem', { name: 'Субтитры: Русский' }))
		await userEvent.click(await within(player).findByRole('menuitemradio', { name: 'English' }))
		await waitFor(() => expect(captions()).toContain('Rise UI Kit demo recording'))

		const button = canvas.getByRole('button', { name: 'Субтитры' })
		await userEvent.click(button)
		await expect(button).toHaveAttribute('aria-pressed', 'false')
		await waitFor(() => expect(captions()).toBe(''))
		await userEvent.click(button)
		await waitFor(() => expect(captions()).toContain('Rise UI Kit demo recording'))
	},
}
