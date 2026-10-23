import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { expect, waitFor, within } from 'storybook/test'
import { DEMO_INTRO, DEMO_OUTRO, storyVideo, DEMO_CLIP_CHAPTERS } from '../../shared'

export const IntroOutro: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Интро и аутро — двумя способами. Отдельные ролики `intro` и `outro` (у серии и плейлиста — свои, `null` отключает',
					'заданный выше): интро играет при запуске с начала, аутро — после серии, до отсчёта следующей; поверх кадра — подпись,',
					"пауза, прогресс и «Пропустить» (сразу или через `skipAfter` секунд). Отметки внутри записи — главы с `kind: 'intro'`",
					"и `'outro'`: на них появляется «Пропустить опенинг» и «Пропустить эндинг». Реклама в начале и в конце идёт раньше роликов.",
				].join('\n'),
			},
		},
	},
	args: { intro: DEMO_INTRO, outro: DEMO_OUTRO, chapters: DEMO_CLIP_CHAPTERS },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await userEvent.click(canvas.getByRole('button', { name: 'Воспроизвести' }))
		await expect(await player.findByRole('region', { name: 'Интро' })).toBeInTheDocument()
		await userEvent.click(await player.findByRole('button', { name: 'Пропустить интро' }))
		await waitFor(() => expect(player.queryByRole('region', { name: 'Интро' })).toBeNull())
		await waitFor(() => expect(storyVideo(canvasElement).paused).toBe(false))
		storyVideo(canvasElement).pause()
	},
}
