import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { DEMO_QUALITIES, storyVideo } from '../shared'
import { expect, waitFor, within } from 'storybook/test'

export const Settings: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Все контролы — отдельные кнопки, как в VideoStack: скорость (`playbackRates`, на кнопке — текущая) и качество',
					'(источники с подписью `label`, если их хотя бы два; переключается с той же позиции) — свои меню. Выбор закрывает',
					'меню. Меню открываются внутри плеера, поэтому видны и в полноэкранном режиме.',
					'Во втором ряду — перемотка на 30 и 5 секунд и автовоспроизведение следующей серии; в узком плеере (уже 640px)',
					'второго ряда нет.',
				].join('\n'),
			},
		},
	},
	args: { sources: DEMO_QUALITIES },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		const speed = canvas.getByRole('button', { name: 'Скорость воспроизведения' })
		await userEvent.click(speed)
		await userEvent.click(await player.findByRole('menuitemradio', { name: '1,5×' }))
		await waitFor(() => expect(storyVideo(canvasElement).playbackRate).toBe(1.5))
		await waitFor(() => expect(player.queryByRole('menu')).toBeNull())
		await expect(speed).toHaveTextContent('1,5×')
		await userEvent.click(canvas.getByRole('button', { name: 'Качество' }))
		await expect(await player.findByRole('menuitemradio', { name: '270p' })).toHaveAttribute('aria-checked', 'true')
	},
}
