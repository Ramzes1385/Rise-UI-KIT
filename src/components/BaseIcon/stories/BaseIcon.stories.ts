/**
 * BaseIcon — stories.
 *
 * Разделы: Default (песочница) → галерея всех иконок спрайта → внешний вид (размеры, цвет) →
 * трансформации (поворот, отражение) → доступность (декоративная и информативная иконка).
 */

import { expect } from 'storybook/test'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup, useArgsWithoutSlots } from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { ICON_SCALE } from '@utils/iconUtils'
import BaseIcon from '../ui/BaseIcon.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/**
 * Имена всех иконок спрайта — файлы `src/icons/svg/*.svg`. Нужны только ключи glob (пути к файлам):
 * сами модули не загружаются, а новая иконка сразу появляется в галерее и в списке Controls.
 */
const ICON_NAMES = Object.keys(import.meta.glob('../../../icons/svg/*.svg'))
	.map(path => path.slice(path.lastIndexOf('/') + 1, -'.svg'.length))
	.sort()

const meta = {
	title: 'Element/BaseIcon',
	component: BaseIcon,
	parameters: {
		docs: {
			description: {
				component: [
					'Иконка из SVG-спрайта библиотеки (`icons.svg`): `<BaseIcon name="search" />`. Имя — имя файла из `src/icons/svg`.',
					'',
					"- Размер 20px при `sizeScale` = 100. Типовые размеры — `calcIconScale('xs' | 'sm' | 'md' | 'lg' | 'xl', sizeScale)`: 12, 16, 20, 28 и 36px.",
					'- Цвет наследуется от текста (`currentColor`); проп `color` задаёт его явно — лучше токеном `var(--rise-…)`.',
					'- Без `ariaLabel` иконка декоративная (`aria-hidden`), с `ariaLabel` — изображение с доступным именем (`role="img"`).',
					'',
					'Путь к спрайту в приложении задаёт `createUiKitPlugin({ iconSpritePath })`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant'),
		name: { control: 'select', options: ICON_NAMES, table: propGroup(ARG_GROUP.content) },
		color: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		rotate: { control: { type: 'range', min: 0, max: 360, step: 45 }, table: propGroup(ARG_GROUP.appearance) },
		isFlipX: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		isFlipY: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	},
	args: {
		name: 'search',
		color: '',
		rotate: 0,
		isFlipX: false,
		isFlipY: false,
		ariaLabel: '',
		sizeScale: 100,
	},
} satisfies Meta<typeof BaseIcon>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: выберите иконку и меняйте props в панели Controls. Размер по умолчанию — 20px. */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const svg = canvasElement.querySelector('svg') as SVGSVGElement
		await expect(svg.querySelector('use')).toHaveAttribute('href', 'icons.svg#search')
		await expect(svg.getBoundingClientRect().width).toBe(20)
		await expect(svg).toHaveAttribute('aria-hidden', 'true')
	},
}

/** Все иконки спрайта с именами. Размер и цвет меняются в Controls для всей сетки. */
export const Gallery: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: { source: { code: '<BaseIcon name="search" />' } },
	},
	render: args => ({
		components: { BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, ['name']), names: ICON_NAMES }),
		template: `
			<div class="story-grid" style="--story-grid-min: 128px;">
				<div v-for="name in names" :key="name" class="story-col" style="align-items: center; gap: 8px;">
					<BaseIcon v-bind="props" :name="name" />
					<span class="story-label" style="min-width: 0;">{{ name }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvas, canvasElement }) => {
		const uses = canvasElement.querySelectorAll('use')
		await expect(uses).toHaveLength(ICON_NAMES.length)
		await expect(uses[0]).toHaveAttribute('href', `icons.svg#${ICON_NAMES[0]}`)
		await expect(canvas.getByText('search')).toBeVisible()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Типовые размеры `ICON_SCALE`: xs 12px, sm 16px (иконка в кнопке и поле), md 20px, lg 28px, xl 36px. */
export const Sizes: Story = {
	parameters: {
		controls: { include: ['name', 'color'] },
		docs: {
			source: {
				code: Object.entries(ICON_SCALE)
					.map(([size, scale]) => `<BaseIcon name="search" :size-scale="${scale}" /> <!-- calcIconScale('${size}') -->`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args), sizes: Object.entries(ICON_SCALE) }),
		template: `
			<div class="story-row" style="align-items: flex-end; gap: 24px;">
				<div v-for="[size, scale] in sizes" :key="size" class="story-col" style="align-items: center; gap: 8px;">
					<BaseIcon v-bind="props" :size-scale="scale" />
					<span class="story-label" style="min-width: 0;">{{ size }} · {{ (20 * scale) / 100 }}px</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const widths = [...canvasElement.querySelectorAll('svg')].map(svg => Math.round(svg.getBoundingClientRect().width))
		await expect(widths).toEqual([12, 16, 20, 28, 36])
	},
}

/**
 * Цвет: без `color` иконка берёт цвет текста вокруг (`currentColor`), с `color` — заданный.
 * Используйте токены: `var(--rise-text-muted)` для второстепенных иконок, цвет роли для статусов.
 */
export const CustomColor: Story = {
	parameters: {
		controls: { include: ['name', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseIcon name="info" color="var(--rise-info)" />',
					'<BaseIcon name="check-circle" color="var(--rise-success)" />',
					'<BaseIcon name="alert-triangle" color="var(--rise-warning)" />',
					'<BaseIcon name="x-circle" color="var(--rise-error)" />',
					'<BaseIcon name="search" color="var(--rise-text-muted)" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['name', 'color']),
			samples: [
				{ name: 'info', token: '--rise-info' },
				{ name: 'check-circle', token: '--rise-success' },
				{ name: 'alert-triangle', token: '--rise-warning' },
				{ name: 'x-circle', token: '--rise-error' },
				{ name: 'search', token: '--rise-text-muted' },
			],
		}),
		template: `
			<div class="story-col">
				<div v-for="sample in samples" :key="sample.token" class="story-row">
					<BaseIcon v-bind="props" :name="sample.name" :color="'var(' + sample.token + ')'" />
					<span class="story-label">{{ sample.token }}</span>
				</div>
				<div class="story-row" style="gap: 6px; color: var(--rise-primary);">
					<BaseIcon v-bind="props" name="star" />
					<span>Без color — цвет текста вокруг</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [info, , , error] = canvasElement.querySelectorAll('svg')
		await expect(error.style.color).toBe('var(--rise-error)')
		await expect(getComputedStyle(error).color).not.toBe(getComputedStyle(info).color)
	},
}

// ─── Трансформации ─────────────────────────────────────────────────────────────

/** Поворот `rotate` (градусы) и отражение `isFlipX` / `isFlipY` — например, одна стрелка на четыре направления. */
export const Transform: Story = {
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			source: {
				code: [
					'<BaseIcon name="arrow-right" :rotate="90" />',
					'<BaseIcon name="arrow-right" is-flip-x />',
					'<BaseIcon name="arrow-right" is-flip-y />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseIcon },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['name', 'rotate', 'isFlipX', 'isFlipY']),
			samples: [
				{ label: 'rotate 0', rotate: 0 },
				{ label: 'rotate 90', rotate: 90 },
				{ label: 'rotate 180', rotate: 180 },
				{ label: 'rotate 270', rotate: 270 },
				{ label: 'isFlipX', isFlipX: true },
				{ label: 'isFlipY', isFlipY: true },
			],
		}),
		template: `
			<div class="story-row" style="gap: 24px;">
				<div v-for="sample in samples" :key="sample.label" class="story-col" style="align-items: center; gap: 8px;">
					<BaseIcon v-bind="props" name="arrow-right" :rotate="sample.rotate" :is-flip-x="sample.isFlipX" :is-flip-y="sample.isFlipY" />
					<span class="story-label" style="min-width: 0;">{{ sample.label }}</span>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const svgs = canvasElement.querySelectorAll('svg')
		await expect(svgs[1].style.transform).toBe('rotate(90deg)')
		await expect(svgs[4].style.transform).toBe('scaleX(-1)')
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Декоративная иконка рядом с текстом скрыта от скринридера (`aria-hidden`): имя кнопки берётся из текста.
 * Иконка без текста, которая несёт смысл, получает `ariaLabel` — становится изображением с доступным именем.
 */
export const AriaLabel: Story = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseButton variant="outline"><template #left><BaseIcon name="download" /></template>Скачать</BaseButton>',
					'<BaseIcon name="check-circle" color="var(--rise-success)" aria-label="Задача выполнена" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseIcon, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, ['name', 'ariaLabel', 'color']) }),
		template: `
			<div class="story-row">
				<BaseButton variant="outline">
					<template #left><BaseIcon v-bind="props" name="download" /></template>
					Скачать
				</BaseButton>
				<BaseIcon v-bind="props" name="check-circle" color="var(--rise-success)" aria-label="Задача выполнена" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: 'Задача выполнена' })).toBeVisible()
		await expect(canvas.getByRole('button')).toHaveAccessibleName('Скачать')
	},
}
