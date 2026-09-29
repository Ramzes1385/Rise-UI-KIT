import { SLIDES } from '../../shared'
import { within, expect } from 'storybook/test'
import type meta from '../../BaseSlider.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import type { SliderItem } from '../../../types/BaseSlider.types'

const LONG_SLIDES: SliderItem[] = [
	{
		...SLIDES[0]!,
		title: 'Многодневный поход по северному склону хребта с ночёвками в палатках, переправами через горные ручьи, днёвкой у ледникового озера и восхождением на вершину к рассвету',
		description:
			'Маршрут для подготовленных туристов: перепад высот около полутора километров, переправы через ручьи, ' +
			'снаряжение выдаётся на базе, группа до десяти человек, опытный инструктор и страховка включены в стоимость.',
	},
	SLIDES[1]!,
]

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные подписи обрезаются до двух строк заголовка и двух строк описания и не закрывают снимок целиком.',
			},
		},
	},
	args: { items: LONG_SLIDES, height: '320px' },
	play: async ({ canvasElement }) => {
		await document.fonts.ready
		const slide = canvasElement.querySelector<HTMLElement>('.base-slider__slide')!
		const caption = slide.querySelector<HTMLElement>('.base-slider__caption')!
		const title = within(caption).getByRole('heading', { level: 3 })
		await expect(title.scrollHeight).toBeGreaterThan(title.clientHeight)
		await expect(caption.getBoundingClientRect().top).toBeGreaterThan(slide.getBoundingClientRect().top)
	},
}
