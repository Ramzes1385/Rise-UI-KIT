import { demoVastUrl } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { expect, waitFor, within } from 'storybook/test'

export const VastAds: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Пауза с адресом VAST (`adBreaks: [{ at: "pre", vast: url }]`): когда подходит время, плеер загружает ответ сети',
					'(без cookie, сервер отвечает с CORS), проходит обёртки (Wrapper, до 5), выбирает ролик, который играет браузер,',
					'не меньше ширины плеера, и показывает его как свою рекламу. Пиксели показа, квартилей, паузы, звука, клика,',
					'пропуска, досмотра и ошибок (с кодом VAST) отправляются сами. VPAID и SIMID не поддерживаются.',
					'В этой story ответ VAST собран в браузере и ссылается на демо-ролик.',
				].join('\n'),
			},
		},
	},
	args: { adBreaks: [{ id: 'network', at: 'pre', vast: demoVastUrl() }] },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await userEvent.click(canvas.getAllByRole('button', { name: 'Воспроизвести' })[0])
		const adVideo = (): string | null | undefined =>
			player.queryByRole('region', { name: 'Реклама' })?.querySelector('video')?.getAttribute('src')
		await waitFor(() => expect(adVideo() ?? '').toContain('demo-144'), { timeout: 4000 })
		const ad = player.getByRole('region', { name: 'Реклама' })
		await expect(within(ad).getByText('Реклама · Демо рекламной сети')).toBeInTheDocument()
		await userEvent.click(await within(ad).findByRole('button', { name: 'Пропустить рекламу' }, { timeout: 4000 }))
		await waitFor(() => expect(player.queryByRole('region', { name: 'Реклама' })).toBeNull())
	},
}
