import { MISSING_SOURCE } from '../../shared'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Источник не загрузился: плеер показывает причину по коду `MediaError` и кнопку «Повторить» — она загружает',
					'запись заново и продолжает с той же позиции. Свой вид сообщения — слот `error` с `{ error, retry }`.',
				].join('\n'),
			},
		},
	},
	args: { sources: MISSING_SOURCE, poster: undefined },
	play: async ({ canvas, args }) => {
		const alert = await canvas.findByRole('alert', {}, { timeout: STORY_WAIT_TIMEOUT })
		await expect(within(alert).getByRole('button', { name: 'Повторить' })).toBeVisible()
		await expect(args.onError).toHaveBeenCalled()
	},
}
