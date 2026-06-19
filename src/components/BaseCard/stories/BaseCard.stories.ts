/**
 * Stories для компонента BaseCard.
 * Демонстрирует все вариации, размеры и слоты.
 */

import { expect, within } from 'storybook/test'
import { UI_TEXT } from '@constants'
import { buildArgTypes } from '@utils/storybookUtils'
import { CARD_VARIANTS } from '../model/BaseCard.types'
import BaseCard from '../ui/BaseCard.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseCard> = {
	title: 'UI/BaseCard',
	component: BaseCard,

	argTypes: buildArgTypes({
		props: {
			title: { control: 'text' },
			subtitle: { control: 'text' },
			isHoverable: { control: 'boolean' },
			variant: {
				control: 'select',
				options: CARD_VARIANTS,
			},
			padding: {
				control: 'object',
				description:
					'Отступы. Число (px): Y = значение, X = значение × 2. Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси. По умолчанию 24 → 24px 48px',
			},
			height: { control: 'text' },
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%)',
			},
			scroll: { control: 'boolean' },
			customClass: { control: 'object' },
		},
	}),

	args: {
		title: 'Карточка',
		subtitle: 'Описание карточки',
		isHoverable: false,
		variant: 'default',
		padding: 24,
		sizeScale: 100,
		scroll: false,
	},
}

export default meta
type Story = StoryObj<typeof BaseCard>
/** Базовая карточка */
export const Default: Story = {
	args: {
		default: 'Содержимое карточки',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Содержимое карточки')).toBeInTheDocument()
	},
}
/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseCard },
		setup() {
			return { args, CARD_VARIANTS }
		},
		template: `
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				<BaseCard v-for="v in CARD_VARIANTS"
					:key="v"
					v-bind="args"
					:variant="v"
					:title="v"
					style="width:240px;"
				>
					Содержимое
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('default')).toBeInTheDocument()
		expect(canvas.getByText('outline')).toBeInTheDocument()
	},
}
/** Интерактивная (с hover) */
export const Hoverable: Story = {
	args: {
		isHoverable: true,
		default: 'Наведите курсор',
	},
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('.base-card')
		expect(card?.classList.contains('base-card--hoverable')).toBe(true)
	},
}
/** С прокруткой и фиксированной высотой */
export const Scrollable: Story = {
	args: {
		title: 'Длинный контент',
		subtitle: 'Карточка с прокруткой',
		height: '300px',
		scroll: true,
		default: `
			<div style="height: 600px; background: linear-gradient(to bottom, var(--color-primary-soft), var(--color-accent)); padding: 20px; border-radius: 8px; color: white;">
				Очень длинный контент для проверки прокрутки...
				<br><br>
				Scroll me!
			</div>
		`,
	},
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('.base-card')
		expect(card?.classList.contains('base-card--scroll')).toBe(true)
	},
}
/** С кастомным padding */
export const CustomPadding: Story = {
	args: {
		title: 'Маленькие отступы',
		padding: 8,
		default: 'Контент с padding: 8px (Y) и 16px (X)',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Маленькие отступы')).toBeInTheDocument()
	},
}
/** Объектный padding: оси x/y и точечные стороны переопределяют оси */
export const ObjectPadding: Story = {
	args: {
		title: 'Объектный padding',
		padding: { x: 32, y: 12, top: 4 },
		default: 'padding: { x: 32, y: 12, top: 4 }',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const root = canvas.getByText('Объектный padding').closest('.base-card')
		if (!(root instanceof HTMLElement)) throw new Error('Карточка не найдена')
		expect(root.style.getPropertyValue('--card-pad-top')).toBe('4px')
		expect(root.style.getPropertyValue('--card-pad-bottom')).toBe('12px')
		expect(root.style.getPropertyValue('--card-pad-left')).toBe('32px')
	},
}
/** С действиями в заголовке */
export const WithActions: Story = {
	render: args => ({
		components: { BaseCard },
		setup() {
			return { args }
		},
		template: `
			<BaseCard v-bind="args" title="Заголовок" subtitle="Подзаголовок">
				<template #actions>
					<button style="background:none;border:none;cursor:pointer;font-size:18px;" title="Меню">⋮</button>
				</template>
				Контент карточки с действиями
			</BaseCard>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Заголовок')).toBeInTheDocument()
		expect(canvas.getByTitle('Меню')).toBeInTheDocument()
	},
}
/** С футером */
export const WithFooter: Story = {
	render: args => ({
		components: { BaseCard },
		setup() {
			return { args }
		},
		template: `
			<BaseCard v-bind="args" title="Карточка с футером">
				Основное содержимое
				<template #footer>
					<div style="display:flex;justify-content:flex-end;gap:8px;">
						<button style="padding:6px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">${UI_TEXT.CANCEL}</button>
						<button style="padding:6px 16px;background:var(--color-accent);color:white;border:none;border-radius:var(--border-radius-base);cursor:pointer;">ОК</button>
					</div>
				</template>
			</BaseCard>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Карточка с футером')).toBeInTheDocument()
		expect(canvas.getByText(UI_TEXT.CANCEL)).toBeInTheDocument()
		expect(canvas.getByText('ОК')).toBeInTheDocument()
	},
}
/** Масштабирование sizeScale */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseCard },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">
				<BaseCard v-for="scale in [75, 100, 150]" :key="scale"
					v-bind="args"
					:size-scale="scale"
					:title="scale + '%'"
					subtitle="Масштабирование"
					style="width:260px;"
				>
					<template #default="{ sizeScale }">
						<p>sizeScale: {{ sizeScale }}</p>
						<div :style="{ fontSize: (16 * sizeScale / 100) + 'px' }">
							Этот текст тоже масштабируется через проп
						</div>
					</template>
				</BaseCard>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('75%')).toBeInTheDocument()
		expect(canvas.getByText('150%')).toBeInTheDocument()
	},
}
/** С усечением (высота без скролла) */
export const Truncated: Story = {
	args: {
		title: 'Усеченная карточка',
		subtitle: 'Фиксированная высота без скролла',
		height: '150px',
		scroll: false,
		default: 'Контент усеченной карточки',
	},
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('.base-card')
		expect(card?.classList.contains('base-card--truncate')).toBe(true)
	},
}
/** С кастомным слотом header */
export const CustomHeader: Story = {
	render: args => ({
		components: { BaseCard },
		setup() {
			return { args }
		},
		template: `
			<BaseCard v-bind="args">
				<template #header>
					<div class="custom-header" style="background: var(--color-primary-soft); padding: 12px; border-radius: 4px; width: 100%;">
						Кастомный заголовок из слота
					</div>
				</template>
				Контент карточки с кастомным заголовком
			</BaseCard>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Кастомный заголовок из слота')).toBeInTheDocument()
	},
}
/** Без заголовка (без шапки) */
export const NoHeader: Story = {
	args: {
		title: '',
		subtitle: '',
		default: 'Карточка без шапки',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Карточка без шапки')).toBeInTheDocument()
		const header = canvasElement.querySelector('.base-card__header')
		expect(header).not.toBeInTheDocument()
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		title: 'Кастомный цвет',
		default: 'Карточка с кастомным цветом',
		color: {
			bg: {
				base: '#ff0000',
				hover: '#cc0000',
				active: '#990000',
				focus: '#ff0000',
			},
			text: {
				base: '#ffffff',
				hover: '#ffffff',
				active: '#ffffff',
				focus: '#ffffff',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Кастомный цвет')).toBeInTheDocument()
	},
}
/** Длинный контент — проверка a11y-дерева с длинным текстом */
export const LongContent: Story = {
	args: {
		title:
			'Очень длинный заголовок карточки который превышает двести символов для проверки того что a11y-дерево корректно обрабатывает длинный контент без усечения и без потери семантики при переполнении контента внутри компонента карточки',
		subtitle:
			'Очень длинное описание карточки которое превышает триста символов и предназначено для проверки того что компонент корректно обрабатывает длинный контент без потери семантики и доступности в a11y-дереве а также что текст не обрезается и остаётся полностью доступным для вспомогательных технологий и скринридеров при чтении длинных сообщений внутри карточки',
		default: 'Содержимое карточки с очень длинным контентом для проверки доступности',
	},
	play: async ({ canvasElement }) => {
		const title = canvasElement.querySelector('.base-card__title')
		expect(title).toBeInTheDocument()
		expect(title?.textContent?.length).toBeGreaterThan(200)
		const subtitle = canvasElement.querySelector('.base-card__subtitle')
		expect(subtitle?.textContent?.length).toBeGreaterThan(300)
	},
}
/** Только заголовок — покрывает ложные ветки `v-if="subtitle"` и `v-if="$slots.actions"` */
export const TitleOnly: Story = {
	args: {
		title: 'Только заголовок',
		subtitle: '',
		default: 'Контент без подзаголовка и без действий',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Только заголовок')).toBeInTheDocument()
		const subtitle = canvasElement.querySelector('.base-card__subtitle')
		expect(subtitle).not.toBeInTheDocument()
		const actions = canvasElement.querySelector('.base-card__actions')
		expect(actions).not.toBeInTheDocument()
	},
}
/** Только подзаголовок — покрывает ложную ветку `v-if="title"` (title пустой, header рендерится из-за subtitle) */
export const SubtitleOnly: Story = {
	args: {
		title: '',
		subtitle: 'Только подзаголовок без заголовка',
		default: 'Контент без заголовка',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Только подзаголовок без заголовка')).toBeInTheDocument()
		const title = canvasElement.querySelector('.base-card__title')
		expect(title).not.toBeInTheDocument()
		const header = canvasElement.querySelector('.base-card__header')
		expect(header).toBeInTheDocument()
	},
}
/** Кастомные CSS-классы через customClass */
export const WithCustomClass: Story = {
	args: {
		customClass: {
			root: 'crd-root',
			header: 'crd-header',
			title: 'crd-title',
			subtitle: 'crd-subtitle',
			actions: 'crd-actions',
			body: 'crd-body',
			footer: 'crd-footer',
		},
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.crd-root')).toBeTruthy()
	},
}
