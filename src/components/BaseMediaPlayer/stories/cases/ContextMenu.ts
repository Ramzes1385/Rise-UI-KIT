import { storyVideo } from '../shared'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, fireEvent, within } from 'storybook/test'

export const ContextMenu: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Правый клик по плееру (или Shift+F10, клавиша «Меню») открывает меню плеера: повтор, ссылка на видео, ссылка с',
					'таймкодом (`shareUrl`, `timeParam`), «Сообщить о проблеме» — форма внутри плеера, отправку делает приложение по',
					'событию `report`, — и техническая информация. Повторный правый клик открывает меню браузера.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await fireEvent.contextMenu(storyVideo(canvasElement), { clientX: 40, clientY: 40 })
		await userEvent.click(await player.findByRole('menuitem', { name: 'Техническая информация' }))
		await expect(player.getByRole('region', { name: 'Техническая информация' })).toHaveTextContent('Разрешение')
	},
}
