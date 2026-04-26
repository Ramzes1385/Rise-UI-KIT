/**
 * Stories для компонента BaseImage.
 * Демонстрирует все режимы и варианты.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseImage from './BaseImage.vue'

const meta: Meta<typeof BaseImage> = {
	title: 'UI/BaseImage',
	component: BaseImage,

	argTypes: {
		src: { control: 'text' },
		alt: { control: 'text' },
		width: { control: 'text' },
		height: { control: 'text' },
		fit: {
			control: 'inline-radio',
			options: ['cover', 'contain', 'fill', 'none'],
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		loading: {
			control: 'inline-radio',
			options: ['lazy', 'eager'],
		},
		borderRadius: {
			control: 'inline-radio',
			options: ['none', 'sm', 'md', 'lg', 'full'],
		},
		hasPlaceholder: { control: 'boolean' },
		aspectRatio: { control: 'text' },
		srcWidth: { control: 'number' },
		hasZoom: { control: 'boolean' },
		closeOnOverlay: { control: 'boolean' },
		initialScale: { control: 'number', min: 0.5, max: 3, step: 0.1 },
		zoomStep: { control: 'number', min: 0.1, max: 1, step: 0.1 },
		minScale: { control: 'number' },
		maxScale: { control: 'number' },
		showMinimap: { control: 'boolean' },
		convertToWebp: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		onLoad: { table: { disable: true } },
		onError: { table: { disable: true } },
		onZoom: { table: { disable: true } },
	},

	args: {
		src: 'https://placehold.co/400x300/f97316/ffffff?text=Metal+Art',
		alt: 'Превью',
		fit: 'cover',
		variant: 'default',
		loading: 'lazy',
		borderRadius: 'md',
		hasPlaceholder: true,
		hasZoom: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseImage>

/** Базовое изображение */
export const Default: Story = {}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseImage },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v" style="width:200px;">
					<p style="margin-bottom:4px;font-size:12px;color:var(--color-text-muted);">{{ v }}</p>
					<BaseImage v-bind="args" :variant="v" width="200" height="150" />
				</div>
			</div>
		`,
	}),
}

/** Все режимы заполнения */
export const Fits: Story = {
	render: args => ({
		components: { BaseImage },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				<div v-for="f in ['cover','contain','fill','none']" :key="f" style="width:200px;">
					<p style="margin-bottom:4px;font-size:12px;color:var(--color-text-muted);">{{ f }}</p>
					<BaseImage v-bind="args" :fit="f" width="200" height="150" />
				</div>
			</div>
		`,
	}),
}

/** Скругления */
export const BorderRadii: Story = {
	render: args => ({
		components: { BaseImage },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				<div v-for="r in ['none','sm','md','lg','full']" :key="r" style="width:120px;">
					<p style="margin-bottom:4px;font-size:12px;color:var(--color-text-muted);">{{ r }}</p>
					<BaseImage v-bind="args" :border-radius="r" width="120" height="120" />
				</div>
			</div>
		`,
	}),
}

/** С аспектным соотношением */
export const AspectRatio: Story = {
	args: {
		aspectRatio: '16/9',
		width: '100%',
	},
}

/** С зумом по клику */
export const WithZoom: Story = {
	args: {
		hasZoom: true,
		src: 'https://placehold.co/800x600/f97316/ffffff?text=Metal+Art+Zoom',
	},
}

/** Зум с мини-картой и поворотом */
export const ZoomWithMinimap: Story = {
	args: {
		hasZoom: true,
		showMinimap: true,
		src: 'https://placehold.co/800x600/f97316/ffffff?text=Metal+Art+Zoom',
	},
}

/** Конвертация в WebP */
export const WebpConversion: Story = {
	args: {
		convertToWebp: true,
		src: 'https://placehold.co/400x300/f97316/ffffff?text=WebP',
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

/** Интерактивное */
export const Interactive: Story = {}
