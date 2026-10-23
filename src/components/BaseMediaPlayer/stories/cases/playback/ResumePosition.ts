import { storyVideo } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'

const STORAGE_KEY = 'rise-media:story-demo'

export const ResumePosition: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'С `storageKey` плеер запоминает позицию в браузере и при следующем открытии предлагает продолжить. Ссылка с',
					'`?t=90` открывает запись с 1:30 (`hasUrlTime`). Двойной клик по левой или правой части кадра — ∓10 с,',
					'удержание кадра во время воспроизведения — ускорение ×2.',
				].join('\n'),
			},
		},
	},
	args: { storageKey: 'story-demo' },
	beforeEach: () => {
		localStorage.setItem(STORAGE_KEY, '7')
		return () => localStorage.removeItem(STORAGE_KEY)
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(await canvas.findByRole('button', { name: 'Продолжить' }))
		await waitFor(() => expect(storyVideo(canvasElement).currentTime).toBeGreaterThanOrEqual(7))
		storyVideo(canvasElement).pause()
	},
}
