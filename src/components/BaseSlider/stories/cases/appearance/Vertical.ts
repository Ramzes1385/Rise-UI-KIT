import { expect } from 'storybook/test'
import { sliderNav } from '../../shared'
import type meta from '../../BaseSlider.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Vertical: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Вертикальная карусель: слайды сменяются сверху вниз, стрелки — сверху и снизу, точки — справа.' } },
	},
	args: { isVertical: true, height: '360px', hasCaption: false },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')
		const track = canvasElement.querySelector<HTMLElement>('.base-slider__track')!
		await expect(track.style.transform).toContain('translateY')
	},
}
