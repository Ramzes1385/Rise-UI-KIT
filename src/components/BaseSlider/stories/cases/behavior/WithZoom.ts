import { sliderNav } from '../../shared'
import type meta from '../../BaseSlider.stories'
import { isRtl } from '@utils/dom/directionUtils'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'

export const WithZoom: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Зум по клику (`isZoomable`): изображение слайда открывает просмотр. Перетаскивание слайда мышью листает',
					'карусель и не открывает просмотр — клик после перетаскивания гасится.',
				].join('\n'),
			},
		},
	},
	args: { isZoomable: true },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const viewport = canvasElement.querySelector<HTMLElement>('.base-slider__viewport')!
		const { left, top, width, height } = viewport.getBoundingClientRect()
		const y = top + height / 2
		const from = isRtl(document.documentElement) ? 0.2 : 0.8
		await userEvent.pointer([
			{
				keys: '[MouseLeft>]',
				target: canvas.getByRole('button', { name: 'Горы на рассвете' }),
				coords: { clientX: left + width * from, clientY: y },
			},
			{ coords: { clientX: left + width * (1 - from), clientY: y } },
			{ keys: '[/MouseLeft]' },
		])
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')
		await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Горы в тумане' }))
		const dialog = await screen.findByRole('dialog', { name: 'Просмотр изображения: Горы в тумане' })
		await waitFor(() => expect(dialog).toBeVisible())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}
