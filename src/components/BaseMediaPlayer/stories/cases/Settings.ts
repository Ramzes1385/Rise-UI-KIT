import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { DEMO_QUALITIES, storyVideo } from '../shared'
import { expect, waitFor, within } from 'storybook/test'

export const Settings: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Меню «Настройки»: скорость из `playbackRates` и качество — из источников с подписью `label`, если их хотя бы два.',
					'Качество переключается с той же позиции. Меню открывается внутри плеера, поэтому видно и в полноэкранном режиме.',
				].join('\n'),
			},
		},
	},
	args: { sources: DEMO_QUALITIES },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Настройки' }))
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await userEvent.click(await player.findByRole('menuitem', { name: /Скорость/ }))
		await userEvent.click(await player.findByRole('menuitemradio', { name: '1,5×' }))
		await waitFor(() => expect(storyVideo(canvasElement).playbackRate).toBe(1.5))
	},
}
