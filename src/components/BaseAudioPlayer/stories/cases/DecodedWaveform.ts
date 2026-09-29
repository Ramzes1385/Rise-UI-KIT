import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseAudioPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const DecodedWaveform: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Без `peaks` плеер считает волну из самого файла через Web Audio: файл должен быть с того же сайта или отдаваться',
					'по CORS. Пока волны нет или файл не декодируется — ровные столбики. Название видно с `hasTitle`.',
				].join('\n'),
			},
		},
	},
	args: { peaks: undefined, hasTitle: true, title: 'Запись с собрания, 14 мая', variant: 'soft' },
	play: async ({ canvasElement }) => {
		const heights = (): string[] => [...canvasElement.querySelectorAll<HTMLElement>('.base-waveform__bar')].map(bar => bar.style.height)
		await waitFor(() => expect(new Set(heights()).size).toBeGreaterThan(3), { timeout: 4000 })
	},
}
