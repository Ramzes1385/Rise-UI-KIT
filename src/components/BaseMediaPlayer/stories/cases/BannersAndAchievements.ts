import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { DEMO_ACHIEVEMENTS, DEMO_BANNERS } from '../shared'

const STORAGE_KEY = 'rise-media:achievements'

export const BannersAndAchievements: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Баннеры (`banners`) появляются в заданное время в выбранном углу кадра: текст, картинка, ссылка в новой вкладке',
					'и «Закрыть»; свой вид — слот `banner`. Показ, переход и закрытие приходят событием `banner`.',
					'Достижения (`achievements`) выдаются, когда зритель досмотрел до секунды `at` или до конца (`at: "end"`), и всплывают',
					'уведомлением, как на jut.su. Каждое выдаётся один раз: полученные хранятся в браузере и приходят в',
					'`earnedAchievements` от приложения; событие `achievement` — чтобы сохранить на сервере. `awardAchievement(id)` —',
					'выдать из кода приложения.',
				].join('\n'),
			},
		},
	},
	args: { banners: DEMO_BANNERS, achievements: DEMO_ACHIEVEMENTS },
	beforeEach: () => {
		localStorage.removeItem(STORAGE_KEY)
		return () => localStorage.removeItem(STORAGE_KEY)
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await userEvent.click(canvas.getAllByRole('button', { name: 'Воспроизвести' })[0])
		await expect(await player.findByRole('link', { name: 'Rise UI Kit — компоненты для Vue' }, { timeout: 3000 })).toHaveAttribute(
			'target',
			'_blank',
		)
		const toast = (): string => canvasElement.querySelector('.base-media-player__achievement')?.textContent ?? ''
		await waitFor(() => expect(toast()).toContain('Первые секунды'), { timeout: 4000 })
		;(canvasElement.querySelector('video') as HTMLVideoElement).pause()
	},
}
