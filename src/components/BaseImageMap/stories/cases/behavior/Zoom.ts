import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Zoom: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Масштаб и сдвиг: кнопки «+», «−», «Сбросить масштаб»; клавиши `+`, `-`, `0`, когда фокус на карте; перетаскивание при увеличении, щипок на телефоне.',
					'Колесо — `wheelZoom`: `ctrl` (по умолчанию, как в Google Картах — без Ctrl или ⌘ страница прокручивается и появляется подсказка), `always`, `none`. Здесь `always` и `maxZoom` = 3.',
				].join('\n'),
			},
		},
	},
	args: { wheelZoom: 'always', maxZoom: 3 },
	play: async ({ canvas, userEvent }) => {
		const zoomIn = canvas.getByRole('button', { name: 'Увеличить' })
		const zoomOut = canvas.getByRole('button', { name: 'Уменьшить' })
		await expect(zoomOut).toBeDisabled()
		await userEvent.click(zoomIn)
		await expect(zoomOut).toBeEnabled()
		await tabTo(canvas.getByRole('button', { name: 'Вершина' }), userEvent)
		await userEvent.keyboard('+')
		await userEvent.keyboard('+')
		await expect(zoomIn).toBeDisabled()
		await userEvent.keyboard('0')
		await expect(zoomOut).toBeDisabled()
		await expect(zoomIn).toBeEnabled()
	},
}
