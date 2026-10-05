import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Zoom: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Масштаб и сдвиг: кнопки «+», «−», «Сбросить масштаб»; клавиши `+`, `-`, `0`, когда фокус на карте; перетаскивание при увеличении, щипок на телефоне. При увеличении окно карты — точка Tab «Увеличенная карта»: стрелки на нём сдвигают вид; фокус на объекте за краем сдвигает вид к нему. На пределе «+» и «−» недоступны, но остаются в фокусе и в порядке Tab (`aria-disabled`).',
					'Колесо — `wheelZoom`: `ctrl` (по умолчанию, как в Google Картах — без Ctrl или ⌘ страница прокручивается и появляется подсказка), `always`, `none`. Здесь `always` и `maxZoom` = 3.',
				].join('\n'),
			},
		},
	},
	args: { wheelZoom: 'always', maxZoom: 3 },
	play: async ({ canvas, userEvent }) => {
		const zoomIn = canvas.getByRole('button', { name: 'Увеличить' })
		const zoomOut = canvas.getByRole('button', { name: 'Уменьшить' })
		await expect(zoomOut).toHaveAttribute('aria-disabled', 'true')
		await expect(canvas.getByRole('button', { name: 'Во весь экран' })).toHaveAttribute('aria-pressed', 'false')
		await userEvent.click(zoomIn)
		await expect(zoomOut).not.toHaveAttribute('aria-disabled')
		await tabTo(canvas.getByRole('button', { name: 'Вершина' }), userEvent)
		await userEvent.keyboard('+')
		await userEvent.keyboard('+')
		await expect(zoomIn).toHaveAttribute('aria-disabled', 'true')
		const viewport = canvas.getByRole('group', { name: 'Увеличенная карта: стрелки сдвигают вид' })
		await userEvent.tab({ shift: true })
		await expect(viewport).toHaveFocus()
		const stage = viewport.firstElementChild as HTMLElement
		const before = stage.style.transform
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(stage.style.transform).not.toBe(before))
		await userEvent.keyboard('0')
		await expect(zoomOut).toHaveAttribute('aria-disabled', 'true')
		await expect(zoomIn).not.toHaveAttribute('aria-disabled')
	},
}
