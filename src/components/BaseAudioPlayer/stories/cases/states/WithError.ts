import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAudioPlayer.stories'
import { STORY_WAIT_TIMEOUT } from '@/stories/helpers'
import { expect, waitFor, within } from 'storybook/test'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Запись не загрузилась: плеер пишет «Не удалось воспроизвести запись» и сообщает `error` с кодом.' },
		},
	},
	args: { src: '/__story-missing-audio__.webm', peaks: undefined },
	play: async ({ canvas, args }) => {
		const alert = await canvas.findByRole('alert', {}, { timeout: STORY_WAIT_TIMEOUT })
		await expect(within(alert).getByText('Не удалось воспроизвести запись')).toBeInTheDocument()
		await waitFor(() => expect(args.onError).toHaveBeenCalled())
	},
}
