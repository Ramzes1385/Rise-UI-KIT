import '@testing-library/jest-dom/vitest'
import BaseSlider from '../ui/BaseSlider.vue'
import type { SliderItem } from '../types/BaseSlider.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const ITEMS: SliderItem[] = [
	{ src: 'slide1.jpg', alt: 'Слайд 1', type: 'image' },
	{ src: 'slide2.jpg', alt: 'Слайд 2', type: 'image' },
]

const VIDEO_ITEMS: SliderItem[] = [{ src: 'video.mp4', type: 'video', poster: 'poster.jpg' }]

describe('BaseSlider unit', () => {
	describe('рендер', () => {
		it('должен рендерить слайдер', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelector('.base-slider')).toBeInTheDocument()
		})

		it('должен рендерить слайды', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelectorAll('.base-slider__slide').length).toBe(2)
		})

		it('должен рендерить изображения', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelectorAll('img').length).toBe(2)
		})

		it('должен рендерить video когда type=video', () => {
			const { container } = render(BaseSlider, {
				props: { items: VIDEO_ITEMS },
			})

			const video = container.querySelector('video')
			expect(video).toBeInTheDocument()
			expect(video?.getAttribute('src')).toBe('video.mp4')
		})
	})

	describe('пропс hasArrows', () => {
		it('должен рендерить стрелки когда hasArrows=true', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: true },
			})

			expect(container.querySelector('.base-slider__arrows')).toBeInTheDocument()
		})

		it('не должен рендерить стрелки когда hasArrows=false', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: false },
			})

			expect(container.querySelector('.base-slider__arrows')).not.toBeInTheDocument()
		})

		it('должен вернуть стрелки после сброса hasArrows=false', async () => {
			const { mount } = await import('@vue/test-utils')
			const wrapper = mount(BaseSlider, {
				props: { items: ITEMS, hasArrows: false },
			})

			expect(wrapper.find('.base-slider__arrows').exists()).toBe(false)

			await wrapper.setProps({ hasArrows: undefined })

			expect(wrapper.find('.base-slider__arrows').exists()).toBe(true)
		})
	})

	describe('пропс navigation', () => {
		it('должен рендерить точки когда navigation=dots', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, navigation: 'dots' },
			})

			expect(container.querySelector('.base-slider__dots')).toBeInTheDocument()
		})

		it('не должен рендерить точки когда navigation=none', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, navigation: 'none' },
			})

			expect(container.querySelector('.base-slider__dots')).not.toBeInTheDocument()
		})

		it('должен рендерить миниатюры когда navigation=thumbnails', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, navigation: 'thumbnails' },
			})

			expect(container.querySelector('.base-slider__thumbs')).toBeInTheDocument()
		})

		it('должен рендерить и точки и миниатюры когда navigation=both', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, navigation: 'both' },
			})

			expect(container.querySelector('.base-slider__dots')).toBeInTheDocument()
			expect(container.querySelector('.base-slider__thumbs')).toBeInTheDocument()
		})

		it('не должен рендерить навигацию когда navigation=none', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, navigation: 'none' },
			})

			expect(container.querySelector('.base-slider__navigation')).not.toBeInTheDocument()
		})
	})

	describe('пропс animation', () => {
		it('должен применять модификатор --slide по умолчанию', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelector('.base-slider')?.classList.contains('base-slider--slide')).toBe(true)
		})

		it('должен применять модификатор --fade когда animation=fade', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, animation: 'fade' },
			})

			expect(container.querySelector('.base-slider')?.classList.contains('base-slider--fade')).toBe(true)
		})

		it('должен применять модификатор --scale когда animation=scale', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, animation: 'scale' },
			})

			expect(container.querySelector('.base-slider')?.classList.contains('base-slider--scale')).toBe(true)
		})

		it('должен применять модификатор --flip когда animation=flip', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, animation: 'flip' },
			})

			expect(container.querySelector('.base-slider')?.classList.contains('base-slider--flip')).toBe(true)
		})
	})

	describe('пропс isVertical', () => {
		it('не должен добавлять класс --vertical по умолчанию', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelector('.base-slider')?.classList.contains('base-slider--vertical')).toBe(false)
		})

		it('должен добавлять класс --vertical когда isVertical=true', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, isVertical: true },
			})

			expect(container.querySelector('.base-slider')?.classList.contains('base-slider--vertical')).toBe(true)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, sizeScale: 100 },
			})

			const slider = container.querySelector('.base-slider') as HTMLElement
			expect(slider.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, sizeScale: 150 },
			})

			const slider = container.querySelector('.base-slider') as HTMLElement
			expect(slider.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('должен устанавливать --size-scale=0.75 когда sizeScale=75', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, sizeScale: 75 },
			})

			const slider = container.querySelector('.base-slider') as HTMLElement
			expect(slider.style.getPropertyValue('--size-scale')).toBe('0.75')
		})
	})

	describe('пропс height', () => {
		it('должен устанавливать height по умолчанию 400px', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			const slider = container.querySelector('.base-slider') as HTMLElement
			expect(slider.style.height).toBe('400px')
		})

		it('должен устанавливать кастомную высоту', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, height: '600px' },
			})

			const slider = container.querySelector('.base-slider') as HTMLElement
			expect(slider.style.height).toBe('600px')
		})
	})

	describe('пропс isLoop', () => {
		it('должен отключить кнопку prev на первом слайде когда isLoop=false', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, isLoop: false, hasArrows: true },
			})

			const prevBtn = container.querySelector('.base-slider__arrow--prev')
			expect(prevBtn?.hasAttribute('disabled')).toBe(true)
		})

		it('не должен отключать кнопку prev когда isLoop=true', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, isLoop: true, hasArrows: true },
			})

			const prevBtn = container.querySelector('.base-slider__arrow--prev')
			expect(prevBtn?.hasAttribute('disabled')).toBe(false)
		})

		it('должен отключить кнопку next на последнем слайде когда isLoop=false', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, isLoop: false, hasArrows: true, initialIndex: 1 },
			})

			const nextBtn = container.querySelector('.base-slider__arrow--next')
			expect(nextBtn?.hasAttribute('disabled')).toBe(true)
		})
	})

	describe('слоты', () => {
		it('должен рендерить слот header', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
				slots: { header: '<div class="custom-header">Заголовок</div>' },
			})

			expect(container.querySelector('.custom-header')).toBeInTheDocument()
		})

		it('должен рендерить слот footer', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
				slots: { footer: '<div class="custom-footer">Подвал</div>' },
			})

			expect(container.querySelector('.custom-footer')).toBeInTheDocument()
		})
	})

	describe('подписи слайдов', () => {
		it('должен рендерить заголовок и описание слайда', () => {
			const itemsWithTitle: SliderItem[] = [
				{ src: 'slide1.jpg', alt: 'Слайд 1', type: 'image', title: 'Заголовок', description: 'Описание' },
			]
			const { container } = render(BaseSlider, {
				props: { items: itemsWithTitle },
			})

			expect(container.querySelector('.base-slider__caption')).toBeInTheDocument()
			expect(container.querySelector('.base-slider__title')).toBeInTheDocument()
			expect(container.querySelector('.base-slider__desc')).toBeInTheDocument()
		})

		it('не должен рендерить caption когда нет title и description', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
			})

			expect(container.querySelector('.base-slider__caption')).not.toBeInTheDocument()
		})
	})

	describe('emit change', () => {
		it('должен эмитить change при навигации к слайду', async () => {
			const { container, emitted } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: true },
			})

			const nextBtn = container.querySelector('.base-slider__arrow--next')!
			await fireEvent.click(nextBtn)

			expect(emitted()['change']).toBeTruthy()
			expect(emitted()['change'][0]).toEqual([1])
		})
	})

	describe('emit next', () => {
		it('должен эмитить next при клике на стрелку next', async () => {
			const { container, emitted } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: true },
			})

			const nextBtn = container.querySelector('.base-slider__arrow--next')!
			await fireEvent.click(nextBtn)

			expect(emitted()['next']).toBeTruthy()
		})
	})

	describe('emit prev', () => {
		it('должен эмитить prev при клике на стрелку prev', async () => {
			const { container, emitted } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: true, isLoop: true, initialIndex: 1 },
			})

			const prevBtn = container.querySelector('.base-slider__arrow--prev')!
			await fireEvent.click(prevBtn)

			expect(emitted()['prev']).toBeTruthy()
		})
	})

	describe('пропс isAutoplay', () => {
		it('должен рендерить слайдер с автопроигрыванием', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, isAutoplay: true },
			})

			expect(container.querySelector('.base-slider')).toBeInTheDocument()
		})
	})

	describe('пропс arrowsPosition', () => {
		it('должен применять модификатор --arrows-center по умолчанию', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: true },
			})

			const slider = container.querySelector('.base-slider')
			expect(slider?.classList.contains('base-slider--arrows-center')).toBe(true)
		})

		it('должен применять модификатор --arrows-top-left когда arrowsPosition=top-left', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, hasArrows: true, arrowsPosition: 'top-left' },
			})

			const slider = container.querySelector('.base-slider')
			expect(slider?.classList.contains('base-slider--arrows-top-left')).toBe(true)
		})
	})

	describe('пропс initialIndex', () => {
		it('должен начинать с указанного слайда', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, initialIndex: 1 },
			})

			const slides = container.querySelectorAll('.base-slider__slide')
			expect(slides[1]?.classList.contains('base-slider__slide--active')).toBe(true)
		})
	})

	describe('scoped default-слот', () => {
		it('должен передавать item и index в scoped default-слот', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS },
				slots: {
					default: `<template #default="{ item, index }">
						<span class="slot-item">{{ item.src }}</span>
						<span class="slot-index">{{ index }}</span>
					</template>`,
				},
			})

			expect(container.querySelector('.slot-item')?.textContent).toBe('slide1.jpg')
			expect(container.querySelector('.slot-index')?.textContent).toBe('0')
		})
	})

	describe('доступность навигации', () => {
		const FOUR_ITEMS: SliderItem[] = [
			{ src: 'slide1.jpg', alt: 'Горы' },
			{ src: 'slide2.jpg', alt: 'Лес' },
			{ src: 'slide3.jpg', alt: 'Река' },
			{ src: 'slide4.jpg', alt: 'Озеро' },
		]

		it('стрелки, точки и миниатюры названы, у текущих — aria-current', async () => {
			render(BaseSlider, { props: { items: FOUR_ITEMS, navigation: 'both' } })

			expect(screen.getByRole('button', { name: 'Предыдущий слайд' })).toBeInTheDocument()
			const [firstDot, firstThumb] = screen.getAllByRole('button', { name: 'Слайд 1 из 4' })
			expect(firstDot).toHaveAttribute('aria-current', 'true')
			expect(firstThumb).toHaveAttribute('aria-current', 'true')

			await fireEvent.click(screen.getByRole('button', { name: 'Следующий слайд' }))

			expect(firstDot).not.toHaveAttribute('aria-current')
			for (const nav of screen.getAllByRole('button', { name: 'Слайд 2 из 4' })) {
				expect(nav).toHaveAttribute('aria-current', 'true')
			}
		})

		it('точка при slidesPerGroup > 1 называет первый слайд своей страницы', () => {
			render(BaseSlider, { props: { items: FOUR_ITEMS, slidesPerGroup: 2 } })

			expect(screen.getByRole('button', { name: 'Слайд 1 из 4' })).toBeInTheDocument()
			expect(screen.getByRole('button', { name: 'Слайд 3 из 4' })).toBeInTheDocument()
		})

		it('миниатюра видео без постера называется номером слайда, а не текстом «Video thumbnail»', () => {
			render(BaseSlider, { props: { items: [...VIDEO_ITEMS, { src: 'slide2.jpg' }], navigation: 'thumbnails' } })

			expect(screen.getByRole('button', { name: 'Слайд 1 из 2' })).toBeInTheDocument()
			expect(screen.queryByAltText('Video thumbnail')).not.toBeInTheDocument()
		})

		it('с одним слайдом стрелки и навигация не выводятся: листать нечего', () => {
			const { container } = render(BaseSlider, { props: { items: [FOUR_ITEMS[0]!], navigation: 'both' } })

			expect(screen.queryAllByRole('button')).toHaveLength(0)
			expect(container.querySelector('.base-slider__navigation')).not.toBeInTheDocument()
		})

		it('без слайдов стрелки и навигация не выводятся', () => {
			render(BaseSlider, { props: { items: [] } })

			expect(screen.queryAllByRole('button')).toHaveLength(0)
		})

		it('невидимые слайды inert: в режиме slide видно slidesPerView слайдов начиная с текущего', async () => {
			const { container } = render(BaseSlider, { props: { items: FOUR_ITEMS, slidesPerView: 2 } })
			const slides = container.querySelectorAll('.base-slider__slide')

			expect(slides[0]).not.toHaveAttribute('inert')
			expect(slides[1]).not.toHaveAttribute('inert')
			expect(slides[2]).toHaveAttribute('inert')

			await fireEvent.click(screen.getByRole('button', { name: 'Следующий слайд' }))

			expect(slides[0]).toHaveAttribute('inert')
			expect(slides[2]).not.toHaveAttribute('inert')
		})

		it('в режиме fade inert все слайды, кроме текущего', () => {
			const { container } = render(BaseSlider, { props: { items: FOUR_ITEMS, animation: 'fade', slidesPerView: 2 } })
			const slides = container.querySelectorAll('.base-slider__slide')

			expect(slides[0]).not.toHaveAttribute('inert')
			expect(slides[1]).toHaveAttribute('inert')
		})
	})

	describe('удержание стрелки', () => {
		afterEach(() => {
			vi.useRealTimers()
		})

		it('листает с интервалом, пока стрелка зажата, и останавливается, когда её отпустили', async () => {
			vi.useFakeTimers()
			const items: SliderItem[] = [1, 2, 3, 4, 5].map(n => ({ src: `slide${n}.jpg`, alt: `Слайд ${n}` }))
			const { emitted } = render(BaseSlider, { props: { items, isLoop: false } })
			const next = screen.getByRole('button', { name: 'Следующий слайд' })

			await fireEvent.mouseDown(next)
			await vi.advanceTimersByTimeAsync(3 * 150)
			await fireEvent.mouseUp(next)
			await vi.advanceTimersByTimeAsync(3 * 150)

			expect(emitted().change).toEqual([[1], [2], [3]])
		})
	})

	describe('пауза автопрокрутки', () => {
		const AUTOPLAY_PROPS = { items: ITEMS, isAutoplay: true, autoplayInterval: 1000 }

		afterEach(() => {
			vi.useRealTimers()
			vi.unstubAllGlobals()
		})

		it('не должен листать, пока фокус внутри слайдера', () => {
			vi.useFakeTimers()
			const { container, emitted } = render(BaseSlider, { props: AUTOPLAY_PROPS })

			container.querySelector<HTMLButtonElement>('.base-slider__arrow--next')!.focus()
			vi.advanceTimersByTime(3000)

			expect(emitted().change).toBeUndefined()
		})

		it('должен возобновлять автопрокрутку, когда фокус покидает слайдер', () => {
			vi.useFakeTimers()
			const { container, emitted } = render(BaseSlider, { props: AUTOPLAY_PROPS })
			const outside = document.createElement('button')
			document.body.appendChild(outside)

			container.querySelector<HTMLButtonElement>('.base-slider__arrow--next')!.focus()
			outside.focus()
			vi.advanceTimersByTime(1000)

			expect(emitted().change).toEqual([[1]])
			outside.remove()
		})

		it('не должен возобновлять автопрокрутку при переходе фокуса между элементами слайдера', () => {
			vi.useFakeTimers()
			const { container, emitted } = render(BaseSlider, { props: AUTOPLAY_PROPS })

			container.querySelector<HTMLButtonElement>('.base-slider__arrow--next')!.focus()
			container.querySelector<HTMLButtonElement>('.base-slider__arrow--prev')!.focus()
			vi.advanceTimersByTime(3000)

			expect(emitted().change).toBeUndefined()
		})

		it('не должен возобновлять автопрокрутку при уходе мыши, пока фокус внутри', async () => {
			vi.useFakeTimers()
			const { container, emitted } = render(BaseSlider, { props: AUTOPLAY_PROPS })
			const root = container.querySelector('.base-slider')!

			await fireEvent.mouseEnter(root)
			container.querySelector<HTMLButtonElement>('.base-slider__arrow--next')!.focus()
			await fireEvent.mouseLeave(root)
			vi.advanceTimersByTime(3000)

			expect(emitted().change).toBeUndefined()
		})

		it('должен ставить на паузу при наведении и возобновлять после ухода мыши', async () => {
			vi.useFakeTimers()
			const { container, emitted } = render(BaseSlider, { props: AUTOPLAY_PROPS })
			const root = container.querySelector('.base-slider')!

			await fireEvent.mouseEnter(root)
			vi.advanceTimersByTime(3000)
			expect(emitted().change).toBeUndefined()

			await fireEvent.mouseLeave(root)
			vi.advanceTimersByTime(1000)
			expect(emitted().change).toEqual([[1]])
		})

		it('не должен запускать автопрокрутку при prefers-reduced-motion: reduce', () => {
			vi.useFakeTimers()
			vi.stubGlobal(
				'matchMedia',
				vi.fn((query: string) => ({
					matches: query === '(prefers-reduced-motion: reduce)',
					media: query,
					addEventListener: vi.fn(),
					removeEventListener: vi.fn(),
				})),
			)
			const { emitted } = render(BaseSlider, { props: AUTOPLAY_PROPS })

			vi.advanceTimersByTime(3000)

			expect(emitted().change).toBeUndefined()
		})
	})

	describe('пропс customClass', () => {
		const STUBS = {
			BaseButton: {
				template: '<button :class="customClass" @click="$emit(\'click\')"><slot /></button>',
				props: ['customClass'],
			},
			BaseText: {
				template: '<span :class="customClass"><slot /></span>',
				props: ['customClass'],
			},
		}

		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, customClass: 'custom-slider-class' },
			})

			expect(container.querySelector('.base-slider')?.classList.contains('custom-slider-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const itemsWithCaption: SliderItem[] = [
				{ src: 'slide1.jpg', alt: 'Слайд 1', type: 'image', title: 'Заголовок', description: 'Описание' },
				{ src: 'slide2.jpg', alt: 'Слайд 2', type: 'image' },
			]
			const { container } = render(BaseSlider, {
				props: {
					items: itemsWithCaption,
					hasArrows: true,
					navigation: 'both',
					customClass: {
						root: 'custom-slider-root',
						arrows: 'custom-slider-arrows',
						arrow: 'custom-slider-arrow',
						viewport: 'custom-slider-viewport',
						track: 'custom-slider-track',
						slide: 'custom-slider-slide',
						caption: 'custom-slider-caption',
						title: 'custom-slider-title',
						desc: 'custom-slider-desc',
						navigation: 'custom-slider-navigation',
						dots: 'custom-slider-dots',
						dot: 'custom-slider-dot',
						thumbs: 'custom-slider-thumbs',
						thumb: 'custom-slider-thumb',
					},
				},
				global: {
					stubs: STUBS,
				},
			})

			expect(container.querySelector('.base-slider')?.classList.contains('custom-slider-root')).toBe(true)
			expect(container.querySelector('.base-slider__arrows')?.classList.contains('custom-slider-arrows')).toBe(true)
			expect(container.querySelector('.base-slider__arrow')?.classList.contains('custom-slider-arrow')).toBe(true)
			expect(container.querySelector('.base-slider__viewport')?.classList.contains('custom-slider-viewport')).toBe(true)
			expect(container.querySelector('.base-slider__track')?.classList.contains('custom-slider-track')).toBe(true)
			expect(container.querySelector('.base-slider__slide')?.classList.contains('custom-slider-slide')).toBe(true)
			expect(container.querySelector('.base-slider__caption')?.classList.contains('custom-slider-caption')).toBe(true)
			expect(container.querySelector('.base-slider__title')?.classList.contains('custom-slider-title')).toBe(true)
			expect(container.querySelector('.base-slider__desc')?.classList.contains('custom-slider-desc')).toBe(true)
			expect(container.querySelector('.base-slider__navigation')?.classList.contains('custom-slider-navigation')).toBe(true)
			expect(container.querySelector('.base-slider__dots')?.classList.contains('custom-slider-dots')).toBe(true)
			expect(container.querySelector('.base-slider__dot')?.classList.contains('custom-slider-dot')).toBe(true)
			expect(container.querySelector('.base-slider__thumbs')?.classList.contains('custom-slider-thumbs')).toBe(true)
			expect(container.querySelector('.base-slider__thumb')?.classList.contains('custom-slider-thumb')).toBe(true)
		})
	})
})
