import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'

const stallPlayback = (audio: HTMLAudioElement): Promise<void> => {
	audio.play = () => new Promise<void>(() => undefined)
	return new Promise(resolve => {
		if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) resolve()
		else audio.addEventListener('canplay', () => resolve(), { once: true })
	})
}

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Показ запущен, а озвучка ещё не загрузилась (медленная сеть; здесь её ожидание эмулирует play-функция): поверх',
					'кадра — индикатор «Загрузка» (`role="status"`), как у BaseMediaPlayer. Панель при этом доступна.',
					'Проверка: Tab до шкалы, Space запускает показ, при ожидании данных виден индикатор загрузки.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const audio = canvasElement.querySelector('audio') as HTMLAudioElement
		const isReady = stallPlayback(audio)
		await tabTo(canvas.getByRole('slider', { name: 'Слайды' }), userEvent)
		await userEvent.keyboard(' ')
		await expect(await canvas.findByRole('button', { name: 'Пауза' })).toBeInTheDocument()
		await isReady
		audio.dispatchEvent(new Event('waiting'))
		const loader = await canvas.findByRole('status', { name: 'Загрузка' })
		await waitFor(() => expect(loader).toBeVisible())
	},
}
