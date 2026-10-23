import { onMounted } from 'vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { installDemoCast } from '../../demo/castDemo'
import { expect, waitFor, within } from 'storybook/test'

export const Cast: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кнопка «Трансляция на телевизор» появляется, когда рядом есть устройство, и открывает выбор устройства. Список',
					'устройств сети показывает браузер: Chrome — окно «Трансляция» с телевизорами и приставками, Safari — AirPlay.',
					'Страница сама получить этот список не может — браузер не даёт сайтам сканировать сеть. Два способа трансляции:',
					'— встроенный в браузер Remote Playback API (Chrome — Chromecast, Safari — AirPlay), управление плеером прежнее;',
					'— Google Cast SDK: приложение подключает скрипт `cast_sender.js?loadCastFramework=1`, плеер находит его сам.',
					'Запись уходит на выбранное устройство с текущей секунды, плеер становится пультом: пауза, перемотка, клавиши, смена',
					'серии. «Остановить трансляцию» — просмотр продолжится здесь с того же места. Своё приложение-приёмник — `castReceiverId`.',
					'В этой истории вместо браузера и телевизора — эмуляция Cast: окно «Трансляция на устройство» сначала ищет устройства,',
					'затем показывает три; Escape или «Отмена» — отказ без ошибки. Настоящую трансляцию проверяйте в Chrome с телевизором',
					'в той же сети: в Яндекс Браузере Chromecast не поддерживается, и кнопки там не будет. Адрес записи должен открываться',
					'с телевизора — `localhost` для него недоступен.',
				].join('\n'),
			},
		},
	},
	decorators: [
		() => ({
			setup() {
				onMounted(installDemoCast())
			},
			template: '<story />',
		}),
	],
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await userEvent.click(await canvas.findByRole('button', { name: 'Трансляция на телевизор' }))
		const picker = within(await within(document.body).findByRole('dialog', { name: 'Трансляция' }))
		await userEvent.click(await picker.findByRole('button', { name: /Телевизор в гостиной/ }, { timeout: 3000 }))
		await expect(await player.findByText('Воспроизводится на «Телевизор в гостиной»', {}, { timeout: 3000 })).toBeInTheDocument()
		await userEvent.click(await player.findByRole('button', { name: 'Пауза' }))
		await expect(await player.findByRole('button', { name: 'Воспроизвести' })).toBeInTheDocument()
		await userEvent.click(player.getByRole('button', { name: 'Остановить трансляцию' }))
		await waitFor(() => expect(canvasElement.querySelector('.base-media-player__cast')).toBeNull())
	},
}
