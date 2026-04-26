/**
 * Stories для компонента BaseCard.
 * Демонстрирует все вариации, размеры и слоты.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseCard from './BaseCard.vue'

const meta: Meta<typeof BaseCard> = {
	title: 'UI/BaseCard',
	component: BaseCard,

	argTypes: {
		title: { control: 'text' },
		subtitle: { control: 'text' },
		image: { control: 'text' },
		imageAlt: { control: 'text' },
		isHoverable: { control: 'boolean' },
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%)',
		},
	},

	args: {
		title: 'Карточка',
		subtitle: 'Описание карточки',
		isHoverable: false,
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseCard>

/** Базовая карточка */
export const Default: Story = {
	args: {
		default: 'Содержимое карточки',
	},
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseCard },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				<BaseCard v-for="v in ['default', 'ghost', 'outline', 'shadow', 'soft']"
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
}

/** Интерактивная (с hover) */
export const Hoverable: Story = {
	args: {
		isHoverable: true,
		default: 'Наведите курсор',
	},
}

/** С изображением */
export const WithImage: Story = {
	args: {
		title: 'Металлическое искусство',
		subtitle: 'Автор: Мастер',
		image: 'https://placehold.co/400x200/f97316/ffffff?text=Art',
		imageAlt: 'Превью',
	},
}

/** С overlay поверх изображения */
export const WithOverlay: Story = {
	render: args => ({
		components: { BaseCard },
		setup() {
			return { args }
		},
		template: `
			<BaseCard
				v-bind="args"
				title="Коллекция"
				image="https://placehold.co/400x200/f97316/ffffff?text=Art"
			>
				<template #overlay>
					<span style="font-size:20px;font-weight:700;">Смотреть коллекцию</span>
				</template>
				Описание коллекции
			</BaseCard>
		`,
	}),
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
						<button style="padding:6px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">Отмена</button>
						<button style="padding:6px 16px;background:var(--color-accent);color:white;border:none;border-radius:var(--border-radius-base);cursor:pointer;">ОК</button>
					</div>
				</template>
			</BaseCard>
		`,
	}),
}

/** Карточка товара */
export const ProductCard: Story = {
	render: args => ({
		components: { BaseCard },
		setup() {
			return { args }
		},
		template: `
			<BaseCard
				v-bind="args"
				title="Кованая роза"
				subtitle="15 000 ₽"
				image="https://placehold.co/400x200/f97316/ffffff?text=Rose"
				is-hoverable
				style="width:300px;"
			>
				<template #actions>
					<button style="background:none;border:none;cursor:pointer;font-size:16px;" title="Избранное">♡</button>
				</template>
				Ручная работа из кованого металла
				<template #footer>
					<button style="width:100%;padding:8px;background:var(--color-accent);color:white;border:none;border-radius:var(--border-radius-base);cursor:pointer;">В корзину</button>
				</template>
			</BaseCard>
		`,
	}),
}

/** Интерактивная */
export const Interactive: Story = {
	args: {
		default: 'Контент',
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
					</template>
				</BaseCard>
			</div>
		`,
	}),
}
