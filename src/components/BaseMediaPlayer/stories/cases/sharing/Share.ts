import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { MEDIA_SHARE_NETWORKS } from '../../../types/panels/MediaShare.types'

export const Share: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			story: { inline: false, height: '560px' },
			description: {
				story: [
					'Кнопка «Поделиться» (`has-share`) и пункт «Поделиться…» в контекстном меню открывают окно внутри плеера: ряд',
					'соцсетей и мессенджеров (ВКонтакте, Telegram, WhatsApp, Одноклассники, Viber, X, Facebook, Reddit, LinkedIn,',
					'Pinterest, Tumblr, Threads, Bluesky, LINE, Weibo, XING, Hacker News, Flipboard, почта) листается стрелками,',
					'ссылка копируется кнопкой «Копировать», переключатель «Начать с …» добавляет позицию (`time-param`). Там, где',
					'браузер умеет системное окно «Поделиться» (Web Share API, телефоны и часть настольных систем), появляется «Ещё».',
					'Набор и порядок соцсетей — `share-networks`, ссылка — `share-url` (по умолчанию адрес страницы); каждое действие',
					'приходит событием `share` — для статистики приложения.',
				].join('\n'),
			},
		},
	},
	args: { hasShare: true, shareUrl: 'https://example.com/watch/rise-demo' },
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Поделиться' }))
		const dialog = within(await canvas.findByRole('dialog', { name: 'Поделиться' }))
		await expect(dialog.getAllByRole('link')).toHaveLength(MEDIA_SHARE_NETWORKS.length)
		await expect(dialog.getByRole('link', { name: 'Telegram' })).toHaveAttribute(
			'href',
			expect.stringContaining('https://t.me/share/url?url=https%3A%2F%2Fexample.com%2Fwatch%2Frise-demo'),
		)
		await userEvent.click(dialog.getByRole('checkbox', { name: /^Начать с/ }))
		await expect(dialog.getByRole('textbox', { name: 'Ссылка на видео' })).toHaveValue('https://example.com/watch/rise-demo?t=0')
	},
}
