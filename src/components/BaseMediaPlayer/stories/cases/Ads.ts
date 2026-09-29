import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { DEMO_AD_BREAKS, DEMO_AD_SEGMENTS } from '../shared'

export const Ads: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Рекламные паузы (`adBreaks`): картинка или ролик перед видео (`pre`), на заданной секунде и после (`post`).',
					'Во время рекламы вместо панели — метка «Реклама · 1 из 2», пауза, «Перейти на сайт» (`clickUrl`, новая вкладка,',
					'`rel="sponsored"`) и «Пропустить через N» (`skipAfter`); щелчок в любом месте объявления тоже открывает сайт.',
					'Клавиши плеера во время рекламы не работают. Паузы в середине — жёлтые метки',
					'на шкале; при перемотке через несколько пауз показывается последняя. Интеграции (`adSegments`) — жёлтые отрезки',
					'на шкале и «Пропустить рекламу». Показы, досмотры, пропуски, клики и ошибки приходят событием `ad`.',
				].join('\n'),
			},
		},
	},
	args: { adBreaks: DEMO_AD_BREAKS, adSegments: DEMO_AD_SEGMENTS },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await userEvent.click(canvas.getAllByRole('button', { name: 'Воспроизвести' })[0])
		const ad = await player.findByRole('region', { name: 'Реклама' })
		await expect(within(ad).getByRole('link', { name: 'Перейти на сайт' })).toHaveAttribute('rel', 'noopener noreferrer sponsored')
		await userEvent.click(await within(ad).findByRole('button', { name: 'Пропустить рекламу' }, { timeout: 3000 }))
		await waitFor(() => expect(player.queryByRole('region', { name: 'Реклама' })).toBeNull())
	},
}
