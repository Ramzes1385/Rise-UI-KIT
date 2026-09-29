import { storyVideo } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import { expect, fireEvent, within } from 'storybook/test'

export const ContextMenu: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Правый клик по плееру (или Shift+F10, клавиша «Меню») открывает меню плеера: повтор, ссылка на видео, ссылка с',
					'таймкодом (`shareUrl`, `timeParam`), «Сообщить о проблеме» — форма внутри плеера, отправку делает приложение по',
					'событию `report`, — и «Данные для отладки». Повторный правый клик открывает меню браузера.',
					'',
					'«Данные для отладки» — панель поверх кадра: показатели (источник, разрешение, пропущенные кадры, буфер) обновляются',
					'раз в секунду; вкладка «События» — лог событий элемента (`waiting`, `seeked`, `error` …) и плеера (`play`, `ad`,',
					'`update:volume` …) со временем и позицией, последние 200. «Скопировать отчёт» кладёт в буфер обмена время, браузер,',
					'страницу, показатели и лог — его можно приложить к обращению; тот же отчёт уходит в `details` события `report`.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await fireEvent.contextMenu(storyVideo(canvasElement), { clientX: 40, clientY: 40 })
		await userEvent.click(await player.findByRole('menuitem', { name: 'Данные для отладки' }))
		const panel = within(player.getByRole('region', { name: 'Данные для отладки' }))
		await expect(panel.getByText('Разрешение')).toBeInTheDocument()
		await userEvent.click(panel.getByRole('button', { name: /^События/ }))
		await expect(await panel.findByText('loadedmetadata')).toBeInTheDocument()
	},
}
