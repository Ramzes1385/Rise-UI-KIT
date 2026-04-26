/**
 * Stories для компонента BaseSlider.
 * Демонстрирует все варианты анимации, навигации и состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import type { SliderItem } from './BaseSlider.types'
import BaseSlider from './BaseSlider.vue'

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

const meta: Meta<typeof BaseSlider> = {
	title: 'UI/BaseSlider',
	component: BaseSlider,

	argTypes: {
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
		items: { control: 'object' },
	},

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
	},
}

export default meta
type Story = StoryObj<typeof BaseSlider>

/** Базовый слайдер */
export const Default: Story = {}

/** Анимация fade */
export const Fade: Story = {
	args: {
		animation: 'fade',
	},
}

/** Анимация scale */
export const Scale: Story = {
	args: {
		animation: 'scale',
	},
}

/** Анимация flip */
export const Flip: Story = {
	args: {
		animation: 'flip',
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
}

/** С миниатюрами */
export const Thumbnails: Story = {
	args: {
		navigation: 'thumbnails',
	},
}

/** Точки + миниатюры */
export const BothNavigation: Story = {
	args: {
		navigation: 'both',
	},
}

/** Без навигации */
export const NoNavigation: Story = {
	args: {
		navigation: 'none',
	},
}

/** Автопроигрывание */
export const Autoplay: Story = {
	args: {
		isAutoplay: true,
		autoplayInterval: 3000,
	},
}

/** Без стрелок */
export const NoArrows: Story = {
	args: {
		hasArrows: false,
		navigation: 'dots',
	},
}

/** Стрелки сверху-слева */
export const ArrowsTopLeft: Story = {
	args: {
		arrowsPosition: 'top-left',
	},
}

/** Стрелки сверху-справа */
export const ArrowsTopRight: Story = {
	args: {
		arrowsPosition: 'top-right',
	},
}

/** Стрелки снизу-слева */
export const ArrowsBottomLeft: Story = {
	args: {
		arrowsPosition: 'bottom-left',
	},
}

/** Стрелки снизу-справа */
export const ArrowsBottomRight: Story = {
	args: {
		arrowsPosition: 'bottom-right',
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
}

/** Без зацикливания */
export const NoLoop: Story = {
	args: {
		isLoop: false,
	},
}

/** Два слайда */
export const TwoSlides: Story = {
	args: {
		items: TWO_ITEMS,
	},
}

/** Вертикальный режим */
export const Vertical: Story = {
	args: {
		isVertical: true,
		height: '500px',
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
}

/** Начальный слайд */
export const InitialIndex: Story = {
	args: {
		initialIndex: 2,
	},
}

/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
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

export const WithVideo: Story = {
	args: {
		items: VIDEO_ITEMS,
		navigation: 'thumbnails',
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
					Импорт: import { useSlider } from '@/shared/composables/useSlider'
				</p>
			</div>
		`,
	}),
}
