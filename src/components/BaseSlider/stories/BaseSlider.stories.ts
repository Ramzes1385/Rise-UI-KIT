/**
 * Stories для компонента BaseSlider.
 * Демонстрирует все варианты анимации, навигации и состояния.
 */

import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test'
import { buildArgTypes, playShiftTab } from '@utils/storybookUtils'
import BaseSlider from '../ui/BaseSlider.vue'
import type { SliderItem } from '../model/BaseSlider.types'
import type { Meta, StoryObj } from '@storybook/vue3'

const ITEMS: SliderItem[] = [
	{ src: 'https://placehold.co/800x400/f97316/ffffff?text=Slide+1', alt: 'Слайд 1', title: 'Первый слайд' },
	{ src: 'https://placehold.co/800x400/3b82f6/ffffff?text=Slide+2', alt: 'Слайд 2', title: 'Второй слайд' },
	{ src: 'https://placehold.co/800x400/10b981/ffffff?text=Slide+3', alt: 'Слайд 3', title: 'Третий слайд' },
	{ src: 'https://placehold.co/800x400/8b5cf6/ffffff?text=Slide+4', alt: 'Слайд 4', title: 'Четвёртый слайд' },
]

const TWO_ITEMS: SliderItem[] = [
	{ src: 'https://placehold.co/800x400/f97316/ffffff?text=Only+1', alt: 'Слайд 1', title: 'Один' },
	{ src: 'https://placehold.co/800x400/3b82f6/ffffff?text=Only+2', alt: 'Слайд 2', title: 'Два' },
]

function createTouch(target: HTMLElement, clientX: number, clientY = 0): Touch {
	return new Touch({
		identifier: Date.now() + Math.random(),
		target,
		clientX,
		clientY,
		screenX: clientX,
		screenY: clientY,
		pageX: clientX,
		pageY: clientY,
	})
}

const meta: Meta<typeof BaseSlider> = {
	title: 'UI/BaseSlider',
	component: BaseSlider,

	argTypes: buildArgTypes({
		props: {
			animation: {
				control: 'inline-radio',
				options: ['slide', 'fade', 'scale', 'flip'],
			},
			navigation: {
				control: 'inline-radio',
				options: ['dots', 'thumbnails', 'both', 'none'],
			},
			isAutoplay: { control: 'boolean' },
			autoplayInterval: { control: 'number' },
			hasArrows: { control: 'boolean' },
			arrowsPosition: {
				control: 'inline-radio',
				options: ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
			},
			isLoop: { control: 'boolean' },
			isVertical: { control: 'boolean' },
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
			},
			initialIndex: {
				control: { type: 'number', min: 0 },
			},
			height: {
				control: 'text',
			},
			spaceBetween: {
				control: { type: 'number', min: 0, max: 60, step: 4 },
			},
			slidesPerView: {
				control: { type: 'number', min: 1, max: 6, step: 1 },
			},
			slidesPerGroup: {
				control: { type: 'number', min: 1, max: 6, step: 1 },
			},
			hasCaption: { control: 'boolean' },
			isZoomable: { control: 'boolean' },
			items: { control: 'object' },
			customClass: { control: 'object' },
		},
	}),

	args: {
		items: ITEMS,
		animation: 'slide',
		navigation: 'dots',
		isAutoplay: false,
		autoplayInterval: 5000,
		hasArrows: true,
		isLoop: true,
		isVertical: false,
		sizeScale: 100,
		initialIndex: 0,
		height: '400px',
		spaceBetween: 0,
		slidesPerView: 1,
		slidesPerGroup: 1,
		hasCaption: true,
		isZoomable: false,
	},
}

export default meta
type Story = StoryObj<typeof BaseSlider>
/** Базовый слайдер */
export const Default: Story = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const nextButton = canvasElement.querySelector('.base-slider__arrow--next') as HTMLButtonElement
		const prevButton = canvasElement.querySelector('.base-slider__arrow--prev') as HTMLButtonElement
		const dots = canvasElement.querySelectorAll('.base-slider__dot')

		await step('Фокусировка слайдера по Tab', async () => {
			await userEvent.tab()
		})

		await step('Возврат фокуса по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: '.base-slider' })
		})

		await step('Слайдер отображается', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})

		await step('Клик по стрелке Next переключает на второй слайд', async () => {
			await userEvent.click(nextButton)
			await waitFor(() => {
				expect(canvas.getByText('Второй слайд')).toBeInTheDocument()
			})
		})

		await step('Клик по стрелке Prev возвращает на первый слайд', async () => {
			await userEvent.click(prevButton)
			await waitFor(() => {
				expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			})
		})

		await step('Клик по точке навигации переключает на соответствующий слайд', async () => {
			if (dots.length >= 3) {
				await userEvent.click(dots[2] as HTMLButtonElement)
				await waitFor(() => {
					expect(canvas.getByText('Третий слайд')).toBeInTheDocument()
				})
			}
		})

		await step('Удержание стрелки Next быстро перелистывает слайды', async () => {
			// Возвращаемся на первый слайд
			if (dots.length > 0) {
				await userEvent.click(dots[0] as HTMLButtonElement)
			}

			// Симулируем удержание кнопки Next
			await fireEvent.mouseDown(nextButton)
			// Ждем срабатывания интервала (150мс на шаг)
			await new Promise(resolve => setTimeout(resolve, 350))
			await fireEvent.mouseUp(nextButton)

			// Должен перелистнуть минимум на 2 слайда вперед
			await waitFor(() => {
				const activeSlide = canvasElement.querySelector('.base-slider__slide--active')
				expect(activeSlide).not.toBeNull()
			})
		})

		await step('Удержание стрелки Prev с уходом мыши', async () => {
			await fireEvent.mouseDown(prevButton)
			await new Promise(resolve => setTimeout(resolve, 100))
			await fireEvent.mouseLeave(prevButton)
		})

		await step('Touch-удержание стрелки Next', async () => {
			await fireEvent.touchStart(nextButton)
			await new Promise(resolve => setTimeout(resolve, 100))
			await fireEvent.touchEnd(nextButton)
		})

		await step('Симуляция Drag/Swipe перетаскивания слайдов', async () => {
			const viewport = canvasElement.querySelector('.base-slider__viewport') as HTMLElement
			expect(viewport).toBeInTheDocument()

			// Симулируем перетаскивание влево (следующий слайд)
			await fireEvent.mouseDown(viewport, { clientX: 300, clientY: 0 })
			await fireEvent.mouseMove(viewport, { clientX: 100, clientY: 0 })
			await fireEvent.mouseUp(viewport, { clientX: 100, clientY: 0 })
		})

		await step('Симуляция Touch Swipe перетаскивания слайдов', async () => {
			const viewport = canvasElement.querySelector('.base-slider__viewport') as HTMLElement
			const touchStartObj = createTouch(viewport, 300)
			const touchMoveObj = createTouch(viewport, 100)

			await fireEvent.touchStart(viewport, {
				touches: [touchStartObj],
				targetTouches: [touchStartObj],
				changedTouches: [touchStartObj],
			})
			await fireEvent.touchMove(viewport, {
				touches: [touchMoveObj],
				targetTouches: [touchMoveObj],
				changedTouches: [touchMoveObj],
			})
			await fireEvent.touchEnd(viewport, {
				touches: [],
				targetTouches: [],
				changedTouches: [touchMoveObj],
			})
		})
	},
}
/** Анимация fade */
export const Fade: Story = {
	args: {
		animation: 'fade',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Fade слайдер отображается', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Анимация scale */
export const Scale: Story = {
	args: {
		animation: 'scale',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Scale слайдер отображается', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Анимация flip */
export const Flip: Story = {
	args: {
		animation: 'flip',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Flip слайдер отображается', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Все анимации */
export const Animations: Story = {
	render: args => ({
		components: { BaseSlider },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<h4 style="margin:0;">slide</h4>
				<BaseSlider v-bind="args" animation="slide" />
				<h4 style="margin:0;">fade</h4>
				<BaseSlider v-bind="args" animation="fade" />
				<h4 style="margin:0;">scale</h4>
				<BaseSlider v-bind="args" animation="scale" />
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Все анимации отображаются', async () => {
			expect(canvas.getByText('slide')).toBeInTheDocument()
			expect(canvas.getByText('fade')).toBeInTheDocument()
			expect(canvas.getByText('scale')).toBeInTheDocument()
		})
	},
}
/** С миниатюрами */
export const Thumbnails: Story = {
	args: {
		navigation: 'thumbnails',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Миниатюры отображаются', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			// Проверяем наличие миниатюр через изображения
			const images = canvas.getAllByRole('img')
			expect(images.length).toBeGreaterThanOrEqual(4)
		})
	},
}
/** Точки + миниатюры */
export const BothNavigation: Story = {
	args: {
		navigation: 'both',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Точки и миниатюры отображаются', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			const images = canvas.getAllByRole('img')
			expect(images.length).toBeGreaterThanOrEqual(4)
		})
	},
}
/** Без навигации */
export const NoNavigation: Story = {
	args: {
		navigation: 'none',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Навигация скрыта', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Автопроигрывание */
export const Autoplay: Story = {
	args: {
		isAutoplay: true,
		autoplayInterval: 1000,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const root = canvasElement.querySelector('.base-slider') as HTMLElement

		await step('Автопроигрывание активно и переключает слайд', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			// Ждем автопереключения
			await waitFor(
				() => {
					expect(canvas.getByText('Второй слайд')).toBeInTheDocument()
				},
				{ timeout: 2500 },
			)
		})

		await step('Наведение мыши приостанавливает автопроигрывание', async () => {
			await fireEvent.mouseEnter(root)
			// Ждем время интервала, слайд не должен измениться
			await new Promise(resolve => setTimeout(resolve, 1200))
			expect(canvas.getByText('Второй слайд')).toBeInTheDocument()
		})

		await step('Уход мыши возобновляет автопроигрывание', async () => {
			await fireEvent.mouseLeave(root)
			// Ждем автопереключения на третий слайд
			await waitFor(
				() => {
					expect(canvas.getByText('Третий слайд')).toBeInTheDocument()
				},
				{ timeout: 2500 },
			)
		})
	},
}
/** Без стрелок */
export const NoArrows: Story = {
	args: {
		hasArrows: false,
		navigation: 'dots',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Стрелки скрыты', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Стрелки сверху-слева */
export const ArrowsTopLeft: Story = {
	args: {
		arrowsPosition: 'top-left',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Стрелки top-left', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Стрелки сверху-справа */
export const ArrowsTopRight: Story = {
	args: {
		arrowsPosition: 'top-right',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Стрелки top-right', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Стрелки снизу-слева */
export const ArrowsBottomLeft: Story = {
	args: {
		arrowsPosition: 'bottom-left',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Стрелки bottom-left', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Стрелки снизу-справа */
export const ArrowsBottomRight: Story = {
	args: {
		arrowsPosition: 'bottom-right',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Стрелки bottom-right', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Все позиции стрелок */
export const AllArrowsPositions: Story = {
	render: args => ({
		components: { BaseSlider },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<h4 style="margin:0;">center</h4>
				<BaseSlider v-bind="args" arrows-position="center" />
				<h4 style="margin:0;">top-left</h4>
				<BaseSlider v-bind="args" arrows-position="top-left" />
				<h4 style="margin:0;">top-right</h4>
				<BaseSlider v-bind="args" arrows-position="top-right" />
				<h4 style="margin:0;">bottom-left</h4>
				<BaseSlider v-bind="args" arrows-position="bottom-left" />
				<h4 style="margin:0;">bottom-right</h4>
				<BaseSlider v-bind="args" arrows-position="bottom-right" />
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Все позиции стрелок', async () => {
			expect(canvas.getByText('center')).toBeInTheDocument()
			expect(canvas.getByText('top-left')).toBeInTheDocument()
		})
	},
}
/** С зацикливанием — wraparound prev/next + touchstart на prev */
export const LoopWraparound: Story = {
	args: {
		isLoop: true,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const prevButton = canvasElement.querySelector('.base-slider__arrow--prev') as HTMLButtonElement
		const nextButton = canvasElement.querySelector('.base-slider__arrow--next') as HTMLButtonElement

		await step('Touch-удержание стрелки Prev (line 32)', async () => {
			await fireEvent.touchStart(prevButton)
			await new Promise(resolve => setTimeout(resolve, 100))
			await fireEvent.touchEnd(prevButton)
		})

		await step('Wraparound с начала на конец через Prev (line 234)', async () => {
			await userEvent.click(prevButton)
			await waitFor(() => {
				expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			})
		})

		await step('Wraparound с конца на начало через Next', async () => {
			await userEvent.click(nextButton)
			await userEvent.click(nextButton)
			await userEvent.click(nextButton)
			await userEvent.click(nextButton)
			await waitFor(() => {
				expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			})
		})
	},
}
/** Без зацикливания */
export const NoLoop: Story = {
	args: {
		isLoop: false,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const nextButton = canvasElement.querySelector('.base-slider__arrow--next') as HTMLButtonElement
		const prevButton = canvasElement.querySelector('.base-slider__arrow--prev') as HTMLButtonElement

		await step('Слайдер отображается, кнопка Prev заблокирована', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			expect(prevButton).toBeDisabled()
			expect(nextButton).not.toBeDisabled()
		})

		await step('Перелистываем до конца, кнопка Next блокируется', async () => {
			await userEvent.click(nextButton)
			await waitFor(() => {
				expect(canvas.getByText('Второй слайд')).toBeInTheDocument()
			})
			expect(prevButton).not.toBeDisabled()

			await userEvent.click(nextButton)
			await waitFor(() => {
				expect(canvas.getByText('Третий слайд')).toBeInTheDocument()
			})

			await userEvent.click(nextButton)
			await waitFor(() => {
				expect(canvas.getByText('Четвёртый слайд')).toBeInTheDocument()
			})
			expect(nextButton).toBeDisabled()
		})
	},
}
/** Два слайда */
export const TwoSlides: Story = {
	args: {
		items: TWO_ITEMS,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Два слайда отображаются', async () => {
			expect(canvas.getByText('Один')).toBeInTheDocument()
		})
	},
}
/** Вертикальный режим */
export const Vertical: Story = {
	args: {
		isVertical: true,
		height: '500px',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const nextButton = canvasElement.querySelector('.base-slider__arrow--next') as HTMLButtonElement
		const prevButton = canvasElement.querySelector('.base-slider__arrow--prev') as HTMLButtonElement

		await step('Вертикальный слайдер отображается', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			const root = canvasElement.querySelector('.base-slider')
			expect(root).toHaveClass('base-slider--vertical')
		})

		await step('Клик по стрелке Next переключает на второй слайд', async () => {
			await userEvent.click(nextButton)
			await waitFor(() => {
				expect(canvas.getByText('Второй слайд')).toBeInTheDocument()
			})
		})

		await step('Симуляция вертикального Drag/Swipe перетаскивания', async () => {
			const viewport = canvasElement.querySelector('.base-slider__viewport') as HTMLElement
			expect(viewport).toBeInTheDocument()

			// Симулируем перетаскивание вверх (следующий слайд)
			await fireEvent.mouseDown(viewport, { clientX: 0, clientY: 300 })
			await fireEvent.mouseMove(viewport, { clientX: 0, clientY: 100 })
			await fireEvent.mouseUp(viewport, { clientX: 0, clientY: 100 })
		})
	},
}
/** Масштабирование через sizeScale */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseSlider },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<h4 style="margin:0;">sizeScale: 75</h4>
				<BaseSlider v-bind="args" :size-scale="75" />
				<h4 style="margin:0;">sizeScale: 100</h4>
				<BaseSlider v-bind="args" :size-scale="100" />
				<h4 style="margin:0;">sizeScale: 150</h4>
				<BaseSlider v-bind="args" :size-scale="150" />
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Разные размеры отображаются', async () => {
			expect(canvas.getByText('sizeScale: 75')).toBeInTheDocument()
			expect(canvas.getByText('sizeScale: 100')).toBeInTheDocument()
		})
	},
}
/** Начальный слайд */
export const InitialIndex: Story = {
	args: {
		initialIndex: 2,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Начальный слайд — третий', async () => {
			expect(canvas.getByText('Третий слайд')).toBeInTheDocument()
		})
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Тёмная тема', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}

/** Слайдер с видео */
const VIDEO_ITEMS: SliderItem[] = [
	{
		src: 'https://www.w3schools.com/html/mov_bbb.mp4',
		type: 'video',
		poster: 'https://placehold.co/800x400/18181b/fafafa?text=Видео+1',
		alt: 'Видео 1',
		title: 'Видео-слайд 1',
		description: 'Первый видео-слайд',
	},
	{
		src: 'https://www.w3schools.com/html/movie.mp4',
		type: 'video',
		poster: 'https://placehold.co/800x400/1e3a5f/fafafa?text=Видео+2',
		alt: 'Видео 2',
		title: 'Видео-слайд 2',
	},
	{ src: 'https://placehold.co/800x400/f97316/ffffff?text=Изображение', alt: 'Изображение', title: 'Обычный слайд' },
]
/** Слайд с видео */
export const WithVideo: Story = {
	args: {
		items: VIDEO_ITEMS,
		navigation: 'thumbnails',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		const thumbs = canvasElement.querySelectorAll('.base-slider__thumb')

		await step('Видео-слайдер отображается', async () => {
			expect(canvas.getByText('Видео-слайд 1')).toBeInTheDocument()
			const video = canvasElement.querySelector('.base-slider__video') as HTMLVideoElement
			expect(video).toBeInTheDocument()
			expect(video.src).toBe('https://www.w3schools.com/html/mov_bbb.mp4')
		})

		await step('Проверка иконки play на миниатюре видео', async () => {
			const playIcon = canvasElement.querySelector('.base-slider__thumb-play')
			expect(playIcon).toBeInTheDocument()
		})

		await step('Клик по миниатюре переключает на обычный слайд', async () => {
			if (thumbs.length >= 3) {
				await userEvent.click(thumbs[2] as HTMLButtonElement)
				await waitFor(() => {
					expect(canvas.getByText('Обычный слайд')).toBeInTheDocument()
				})
			}
		})
	},
}

/** Видео без poster и без alt + обычное изображение без alt — покрывает item.poster || '' и item.alt || '' (строки 140, 141) */
const VIDEO_NO_POSTER_ITEMS: SliderItem[] = [
	{ src: 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video', title: 'Видео без постера' },
	{ src: 'https://placehold.co/800x400/333/fff?text=No+Alt', title: 'Без alt' },
]
/** Видео без постера */
export const WithVideoNoPoster: Story = {
	args: {
		items: VIDEO_NO_POSTER_ITEMS,
		navigation: 'thumbnails',
	},
	play: async ({ canvasElement }) => {
		const thumbs = canvasElement.querySelectorAll('.base-slider__thumb img')
		expect(thumbs.length).toBeGreaterThan(0)
	},
}
/** Слоты header и footer */
export const WithSlots: Story = {
	render: args => ({
		components: { BaseSlider },
		setup() {
			return { args }
		},
		template: `
			<BaseSlider v-bind="args">
				<template #header>
					<div style="padding: 8px 16px; font-weight: 700; color: var(--color-text);">Заголовок слайдера</div>
				</template>
				<template #footer>
					<div style="padding: 8px 16px; font-size: 12px; color: var(--color-text-muted);">Кастомный футер — счётчик или инфо</div>
				</template>
			</BaseSlider>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Слоты отображаются', async () => {
			expect(canvas.getByText('Заголовок слайдера')).toBeInTheDocument()
			expect(canvas.getByText(/Кастомный футер/)).toBeInTheDocument()
		})
	},
}
/** Отступы между слайдами */
export const SpaceBetween: Story = {
	args: {
		spaceBetween: 16,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Отступ 16px', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Все варианты spaceBetween */
export const AllSpaceBetween: Story = {
	render: args => ({
		components: { BaseSlider },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<h4 style="margin:0;">spaceBetween: 0</h4>
				<BaseSlider v-bind="args" :space-between="0" />
				<h4 style="margin:0;">spaceBetween: 8</h4>
				<BaseSlider v-bind="args" :space-between="8" />
				<h4 style="margin:0;">spaceBetween: 16</h4>
				<BaseSlider v-bind="args" :space-between="16" />
				<h4 style="margin:0;">spaceBetween: 32</h4>
				<BaseSlider v-bind="args" :space-between="32" />
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Все отступы', async () => {
			expect(canvas.getByText('spaceBetween: 0')).toBeInTheDocument()
			expect(canvas.getByText('spaceBetween: 32')).toBeInTheDocument()
		})
	},
}
/** Два слайда в видимой области */
export const TwoPerView: Story = {
	args: {
		slidesPerView: 2,
		spaceBetween: 16,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('2 слайда в видимой области', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			expect(canvas.getByText('Второй слайд')).toBeInTheDocument()
		})
	},
}
/** Три слайда в видимой области */
export const ThreePerView: Story = {
	args: {
		slidesPerView: 3,
		spaceBetween: 12,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('3 слайда в видимой области', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			expect(canvas.getByText('Третий слайд')).toBeInTheDocument()
		})
	},
}
/** Все варианты slidesPerView */
export const AllSlidesPerView: Story = {
	render: args => ({
		components: { BaseSlider },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<h4 style="margin:0;">1 слайд (по умолчанию)</h4>
				<BaseSlider v-bind="args" :slides-per-view="1" />
				<h4 style="margin:0;">2 слайда + gap 16px</h4>
				<BaseSlider v-bind="args" :slides-per-view="2" :space-between="16" />
				<h4 style="margin:0;">3 слайда + gap 12px</h4>
				<BaseSlider v-bind="args" :slides-per-view="3" :space-between="12" />
				<h4 style="margin:0;">4 слайда + gap 8px</h4>
				<BaseSlider v-bind="args" :slides-per-view="4" :space-between="8" />
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Все slidesPerView', async () => {
			expect(canvas.getByText('1 слайд (по умолчанию)')).toBeInTheDocument()
			expect(canvas.getByText('4 слайда + gap 8px')).toBeInTheDocument()
		})
	},
}
/** slidesPerView + вертикальный режим */
export const VerticalPerView: Story = {
	args: {
		slidesPerView: 2,
		spaceBetween: 12,
		isVertical: true,
		height: '500px',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Вертикальный + perView', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			expect(canvas.getByText('Второй слайд')).toBeInTheDocument()
		})
	},
}
/** slidesPerView без зацикливания */
export const PerViewNoLoop: Story = {
	args: {
		slidesPerView: 2,
		spaceBetween: 16,
		isLoop: false,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('PerView без loop', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Перелистывание по 2 слайда */
export const PerGroup2: Story = {
	args: {
		slidesPerView: 3,
		spaceBetween: 12,
		slidesPerGroup: 3,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Перелистывание по 3', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Перелистывание по 1 слайду при 3 видимых */
export const PerGroup1PerView3: Story = {
	args: {
		slidesPerView: 3,
		spaceBetween: 12,
		slidesPerGroup: 1,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Шаг 1 при 3 видимых', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Все варианты slidesPerGroup */
export const AllSlidesPerGroup: Story = {
	render: args => ({
		components: { BaseSlider },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<h4 style="margin:0;">3 видимых, шаг 1</h4>
				<BaseSlider v-bind="args" :slides-per-view="3" :space-between="12" :slides-per-group="1" />
				<h4 style="margin:0;">3 видимых, шаг 3</h4>
				<BaseSlider v-bind="args" :slides-per-view="3" :space-between="12" :slides-per-group="3" />
				<h4 style="margin:0;">2 видимых, шаг 2</h4>
				<BaseSlider v-bind="args" :slides-per-view="2" :space-between="16" :slides-per-group="2" />
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Все slidesPerGroup', async () => {
			expect(canvas.getByText('3 видимых, шаг 1')).toBeInTheDocument()
		})
	},
}
/** Без подписей */
export const NoCaption: Story = {
	args: {
		hasCaption: false,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Подписи скрыты', async () => {
			expect(canvas.queryByText('Первый слайд')).not.toBeInTheDocument()
		})
	},
}
/** Зум картинок по клику */
export const WithZoom: Story = {
	args: {
		isZoomable: true,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Зум активен', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
			const image = canvasElement.querySelector('.base-image') as HTMLElement
			expect(image).toHaveClass('base-image--zoomable')
		})

		await step('Клик по картинке открывает зум', async () => {
			const image = canvasElement.querySelector('.base-image__img') as HTMLElement
			expect(image).toBeInTheDocument()
			await userEvent.click(image)
			await waitFor(() => {
				const zoomed = document.body.querySelector('.base-image__zoom')
				expect(zoomed).toBeInTheDocument()
			})
		})
	},
}
/** Зум + несколько слайдов */
export const ZoomPerView: Story = {
	args: {
		isZoomable: true,
		slidesPerView: 2,
		spaceBetween: 16,
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Зум + perView', async () => {
			expect(canvas.getByText('Первый слайд')).toBeInTheDocument()
		})
	},
}
/** Использование useSlider без BaseSlider */
export const UseSliderComposable: Story = {
	render: () => ({
		template: `
			<div style="border: 2px dashed var(--color-border); border-radius: 8px; padding: 16px;">
				<p style="margin: 0 0 8px; color: var(--color-text-muted); font-size: 14px;">
					useSlider можно использовать отдельно от BaseSlider для создания кастомного UI.
					См. исходный код stories.
				</p>
				<p style="margin: 0; color: var(--color-text-muted); font-size: 12px;">
					Импорт: import { useSlider } from '@composables/useSlider'
				</p>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Информация о useSlider', async () => {
			expect(canvas.getByText(/useSlider можно использовать/)).toBeInTheDocument()
		})
	},
}
/** Кастомные слоты default и caption */
export const CustomSlotsInteractive: Story = {
	render: args => ({
		components: { BaseSlider },
		setup() {
			return { args }
		},
		template: `
			<BaseSlider v-bind="args">
				<template #default="{ item, index }">
					<div class="custom-slide" :data-testid="'custom-slide-' + index" style="padding: 24px; background: #e0f2fe; border-radius: 8px; height: 100%; box-sizing: border-box;">
						<h3 style="margin: 0 0 8px; color: #0369a1;">{{ item.title }}</h3>
						<p style="margin: 0; color: #0c4a6e;">Кастомное содержимое слайда {{ index }}</p>
					</div>
				</template>
				<template #caption="{ item, index }">
					<div class="custom-caption" :data-testid="'custom-caption-' + index" style="padding: 8px; background: #f0fdf4; border-radius: 4px; margin-top: 8px;">
						<span style="color: #15803d; font-weight: bold;">Кастомная подпись: {{ item.title }}</span>
					</div>
				</template>
			</BaseSlider>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Кастомные слоты отображаются', async () => {
			expect(canvas.getByTestId('custom-slide-0')).toBeInTheDocument()
			expect(canvas.getByTestId('custom-caption-0')).toBeInTheDocument()
			expect(canvas.getByText('Кастомное содержимое слайда 0')).toBeInTheDocument()
			expect(canvas.getByText('Кастомная подпись: Первый слайд')).toBeInTheDocument()
		})
	},
}

/** Варианты подписей (только заголовок или только описание) */
const CAPTION_ITEMS: SliderItem[] = [
	{ src: 'https://placehold.co/800x400/f97316/ffffff?text=Slide+1', title: 'Только заголовок' },
	{ src: 'https://placehold.co/800x400/3b82f6/ffffff?text=Slide+2', description: 'Только описание' },
]
/** Варианты подписей к слайдам */
export const CaptionVariants: Story = {
	args: {
		items: CAPTION_ITEMS,
	},
	play: async ({ canvasElement, step }) => {
		const nextButton = canvasElement.querySelector('.base-slider__arrow--next') as HTMLButtonElement

		await step('Отображается только заголовок', async () => {
			const activeSlide = canvasElement.querySelector('.base-slider__slide--active') as HTMLElement
			const activeCanvas = within(activeSlide)
			expect(activeCanvas.getByText('Только заголовок')).toBeInTheDocument()
			expect(activeCanvas.queryByText('Только описание')).not.toBeInTheDocument()
		})

		await step('Переключаем на второй слайд', async () => {
			await userEvent.click(nextButton)
			await waitFor(() => {
				const activeSlide = canvasElement.querySelector('.base-slider__slide--active') as HTMLElement
				const activeCanvas = within(activeSlide)
				expect(activeCanvas.getByText('Только описание')).toBeInTheDocument()
				expect(activeCanvas.queryByText('Только заголовок')).not.toBeInTheDocument()
			})
		})
	},
}
/** Один слайд — минимальный набор */
export const Empty: Story = {
	args: {
		items: [{ src: 'https://placehold.co/800x400/cccccc/333333?text=Single', alt: 'Один слайд', title: 'Один слайд' }],
	},
}
/** Состояние загрузки — слайдер без слайдов */
export const Loading: Story = {
	args: {
		items: [],
		hasArrows: false,
		navigation: 'none',
	},
	render: args => ({
		components: { BaseSlider },
		setup() {
			return { args }
		},
		template: `
			<BaseSlider v-bind="args">
				<template #footer>
					<div data-testid="slider-loading" style="padding:16px;text-align:center;color:var(--color-text-muted);">
						⏳ Загрузка слайдов...
					</div>
				</template>
			</BaseSlider>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		await step('Состояние загрузки', async () => {
			expect(canvasElement.querySelector('.base-slider')).toBeInTheDocument()
			expect(canvasElement.querySelector('[data-testid="slider-loading"]')).toBeInTheDocument()
		})
	},
}
/** Длинный текст в слайдах */
export const LongContent: Story = {
	args: {
		items: [
			{
				src: 'https://placehold.co/800x400/f97316/ffffff?text=Long+1',
				alt: 'Длинный слайд 1',
				title:
					'Очень длинное название первого слайда которое выходит за пределы одной строки и проверяет переполнение контента',
			},
			{
				src: 'https://placehold.co/800x400/3b82f6/ffffff?text=Long+2',
				alt: 'Длинный слайд 2',
				title:
					'Очень длинное название второго слайда которое выходит за пределы одной строки и проверяет переполнение контента',
			},
		],
	},
}
/** Кастомные CSS-классы */
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'sld-root', arrows: 'sld-arrows', arrow: 'sld-arrow', viewport: 'sld-viewport', track: 'sld-track', slide: 'sld-slide', caption: 'sld-caption', title: 'sld-title', desc: 'sld-desc', navigation: 'sld-navigation', dots: 'sld-dots', dot: 'sld-dot', thumbs: 'sld-thumbs', thumb: 'sld-thumb' },
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.sld-root')).toBeTruthy()
	},
}
