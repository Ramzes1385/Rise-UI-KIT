import { expect, waitFor } from 'storybook/test'
import { installDemoMicrophone } from '../micDemo'
import type meta from '../BaseVoiceRecorder.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Preview: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Готовая запись: волна из уровней звука во время записи, «Удалить» и «Отправить».' } },
	},
	args: { variant: 'soft' },
	beforeEach: () => installDemoMicrophone(),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Записать голосовое сообщение' }))
		const stop = await canvas.findByRole('button', { name: 'Остановить запись' })
		await waitFor(() => expect(stop).toBeEnabled())
		await new Promise(resolve => setTimeout(resolve, 1500))
		await userEvent.click(stop)
		await expect(await canvas.findByRole('button', { name: 'Удалить запись' })).toBeInTheDocument()
	},
}
