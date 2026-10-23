import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseAudioPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Голосовое сообщение: до запуска видна длительность, после — позиция. Скорость переключается по кругу 1× → 1,5× → 2×.',
					'Клавиатура: Tab до кнопки, Enter или пробел — пуск и пауза; на волне стрелки перематывают.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		const player = canvas.getByRole('group', { name: 'Голосовое сообщение' })
		const audio = canvasElement.querySelector('audio') as HTMLAudioElement
		await expect(player).toHaveTextContent('0:09')
		await userEvent.click(canvas.getByRole('button', { name: 'Скорость 1×' }))
		await expect(canvas.getByRole('button', { name: 'Скорость 1,5×' })).toBeInTheDocument()

		await tabTo(canvas.getByRole('button', { name: 'Воспроизвести' }), userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(args.onPlay).toHaveBeenCalled())
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(audio.paused).toBe(true))
		audio.currentTime = 3
		await waitFor(() => expect(player).toHaveTextContent('0:03 / 0:09'))
	},
}
