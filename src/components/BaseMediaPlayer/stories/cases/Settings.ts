import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { DEMO_QUALITIES, storyVideo } from '../shared'
import { expect, waitFor, within } from 'storybook/test'

export const Settings: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Все контролы — отдельные кнопки, как в VideoStack. Скорость — панель как в YouTube: крупно текущее значение,',
					'ползунок от 0,25× до 4× с шагом 0,05, кнопки «−» и «+» и готовые значения `playbackRates`; на кнопке — текущая.',
					'Качество (источники с подписью `label`, если их хотя бы два; переключается с той же позиции) — своё меню,',
					'выбор закрывает его. Вложенные списки открываются на месте текущего, с «Назад», — каскадов в плеере нет.',
					'Меню открываются внутри плеера, поэтому видны и в полноэкранном режиме. Перемотка на 30, 10 и 5 секунд — во',
					'втором ряду, он раскрывается кнопкой «Точная перемотка». Озвучка — только значком, название дорожки — в подсказке.',
				].join('\n'),
			},
		},
	},
	args: { sources: DEMO_QUALITIES },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		const speed = canvas.getByRole('button', { name: 'Скорость воспроизведения' })
		await userEvent.click(speed)
		await expect(await player.findByRole('slider', { name: 'Скорость воспроизведения' })).toHaveFocus()
		await userEvent.click(player.getByRole('button', { name: '1,5' }))
		await waitFor(() => expect(storyVideo(canvasElement).playbackRate).toBe(1.5))
		await expect(speed).toHaveTextContent('1,5×')
		await userEvent.click(canvas.getByRole('button', { name: 'Качество' }))
		await waitFor(() => expect(player.queryByRole('group', { name: 'Скорость воспроизведения' })).toBeNull())
		await expect(await player.findByRole('menuitemradio', { name: '270p' })).toHaveAttribute('aria-checked', 'true')
	},
}
