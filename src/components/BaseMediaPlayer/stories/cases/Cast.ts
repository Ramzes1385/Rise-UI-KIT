import { installDemoCast } from '../castDemo'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'

export const Cast: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кнопка «Трансляция на телевизор» появляется, когда рядом есть устройство. Два способа:',
					'— встроенный в браузер Remote Playback API (Chrome — Chromecast, Safari — AirPlay): браузер сам показывает выбор',
					'устройства, управление плеером остаётся прежним;',
					'— Google Cast SDK: приложение подключает скрипт `cast_sender.js?loadCastFramework=1`, плеер находит его сам.',
					'Запись уходит на телевизор с текущей секунды, плеер становится пультом: пауза, перемотка, клавиши, смена серии.',
					'«Остановить трансляцию» — просмотр продолжится здесь с того же места. Своё приложение-приёмник — `castReceiverId`.',
					'В этой истории вместо настоящего телевизора — эмуляция Cast («Демо-телевизор»), чтобы показать вид плеера.',
				].join('\n'),
			},
		},
	},
	beforeEach: () => installDemoCast(),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await userEvent.click(await canvas.findByRole('button', { name: 'Трансляция на телевизор' }))
		await expect(await player.findByText('Воспроизводится на «Демо-телевизор»', {}, { timeout: 3000 })).toBeInTheDocument()
		await userEvent.click(await player.findByRole('button', { name: 'Пауза' }))
		await expect(await player.findByRole('button', { name: 'Воспроизвести' })).toBeInTheDocument()
		await userEvent.click(player.getByRole('button', { name: 'Остановить трансляцию' }))
		await waitFor(() => expect(canvasElement.querySelector('.base-media-player__cast')).toBeNull())
	},
}
