import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import { installDemoMicrophone } from '../micDemo'
import type meta from '../BaseVoiceRecorder.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Запись, остановка, прослушивание и отправка. Клавиатура: Tab до кнопки микрофона, Enter — начать запись.',
			},
		},
	},
	beforeEach: () => installDemoMicrophone(),
	play: async ({ canvas, userEvent, args }) => {
		await tabTo(canvas.getByRole('button', { name: 'Записать голосовое сообщение' }), userEvent)
		await userEvent.keyboard('{Enter}')
		const stop = await canvas.findByRole('button', { name: 'Остановить запись' })
		await waitFor(() => expect(stop).toBeEnabled())
		await new Promise(resolve => setTimeout(resolve, 1200))
		await userEvent.click(stop)
		await expect(await canvas.findByRole('group', { name: 'Записанное сообщение' })).toBeInTheDocument()
		await userEvent.click(canvas.getByRole('button', { name: 'Отправить' }))
		await waitFor(() => expect(args.onRecord).toHaveBeenCalledOnce())
	},
}
