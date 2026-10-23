import { onMounted } from 'vue'
import { demoSeries } from '../shared'
import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseMediaPlayer.stories'
import { installDemoCast } from '../demo/castDemo'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Все кнопки плеера сразу: сериал из двух сезонов (`playlists`) — соседние серии, главы с «Пропустить»,',
					'автовоспроизведение и панель серий с вкладкой «В ролях» (актёры со ссылками на соцсети, `actors`), два качества,',
					'субтитры и озвучки первой серии, превью кадра на шкале, совместный просмотр (`watch-party`), «Поделиться»',
					'(`has-share`), трансляция (здесь — эмуляция Cast, как в истории Cast), «Картинка в картинке», широкий и полный экран.',
					'«Точная перемотка» раскрывает второй ряд: ±30, ±10, ±5 с и подсветку. Если окно узкое, плеер убирает лишнее по',
					'правилам подгонки панели — кнопки не наезжают друг на друга. Меняйте props в панели Controls.',
					'Проверка: Tab до перемотки, → сдвигает позицию на `seekStep`, M выключает и включает звук.',
				].join('\n'),
			},
		},
	},
	args: {
		title: 'Демо-сериал',
		playlists: demoSeries(),
		watchParty: {
			link: 'https://example.com/watch/rise-room',
			members: [{ id: 'me', name: 'Вы', status: 'joined' as const, isHost: true }],
		},
		hasShare: true,
		shareUrl: 'https://example.com/watch/rise-demo',
	},
	decorators: [
		() => ({
			setup() {
				onMounted(installDemoCast())
			},
			template: '<story />',
		}),
	],
	play: async ({ canvas, userEvent }) => {
		const seek = canvas.getByRole('slider', { name: 'Перемотка' })
		await waitFor(() => expect(seek).toHaveAttribute('aria-valuetext', '0:00 из 0:12'))
		await expect(canvas.getByRole('button', { name: 'Поделиться' })).toBeInTheDocument()
		await expect(canvas.getByRole('button', { name: 'Серии' })).toBeInTheDocument()

		await tabTo(seek, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(seek).toHaveAttribute('aria-valuetext', '0:05 из 0:12'))

		await userEvent.keyboard('m')
		await expect(canvas.getByRole('button', { name: 'Включить звук' })).toBeInTheDocument()
		await userEvent.keyboard('m')
		await expect(canvas.getByRole('button', { name: 'Выключить звук' })).toBeInTheDocument()
	},
}
