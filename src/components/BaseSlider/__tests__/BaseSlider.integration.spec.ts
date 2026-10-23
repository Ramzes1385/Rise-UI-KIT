import '@testing-library/jest-dom/vitest'
import BaseSlider from '../ui/BaseSlider.vue'
import { render } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import type { SliderItem } from '../types/BaseSlider.types'

const ITEMS: SliderItem[] = [
	{ src: 'slide1.jpg', alt: 'Слайд 1', type: 'image' },
	{ src: 'slide2.jpg', alt: 'Слайд 2', type: 'image' },
	{ src: 'slide3.jpg', alt: 'Слайд 3', type: 'image' },
]

describe('BaseSlider integration', () => {
	describe('навигация', () => {
		it('должен переключать слайд при клике на точку', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, navigation: 'dots' },
			})

			expect(container.querySelector('.base-slider__slide--active')).toBeInTheDocument()

			const dots = container.querySelectorAll('.base-slider__dot')
			await user.click(dots[1])

			const activeSlide = container.querySelector('.base-slider__slide--active')
			expect(activeSlide).toBeInTheDocument()
		})

		it('должен переключать слайд при клике на стрелку next', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: true },
			})

			const nextBtn = container.querySelector('.base-slider__arrow--next') as HTMLElement
			await user.click(nextBtn)

			expect(container.querySelector('.base-slider__slide--active')).toBeInTheDocument()
		})
	})
})
