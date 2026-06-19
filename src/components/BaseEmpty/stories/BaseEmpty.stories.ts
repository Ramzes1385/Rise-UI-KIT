/**
 * Stories для компонента BaseEmpty.
 * Демонстрирует все варианты пустого состояния, интерактивные состояния, слоты и масштабирование.
 */

import { expect, fn, userEvent, within } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import { BaseText } from '@components/BaseText'
import { buildArgTypes } from '@utils/storybookUtils'
import BaseEmpty from '../ui/BaseEmpty.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseEmpty> = {
	title: 'UI/BaseEmpty',
	component: BaseEmpty,

	argTypes: buildArgTypes({
		props: {
			title: {
				control: 'text',
				description: 'Заголовок пустого состояния',
			},
			description: {
				control: 'text',
				description: 'Текст описания',
			},
			icon: {
				control: 'text',
				description: 'Имя иконки по умолчанию',
			},
			variant: {
				control: 'select',
				options: ['default', 'ghost', 'soft'],
				description: 'Вариант визуального оформления',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%)',
			},
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			customClass: { control: 'object' },
		},
	}),

	args: {
		title: 'Нет данных',
		description: 'Попробуйте изменить параметры фильтрации или обновить страницу.',
		icon: 'inbox',
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseEmpty>
/** Базовое пустое состояние */
export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Нет данных')).toBeInTheDocument()
		expect(canvas.getByText('Попробуйте изменить параметры фильтрации или обновить страницу.')).toBeInTheDocument()
	},
}
/** Все варианты оформления */
export const AllVariants: Story = {
	render: args => ({
		components: { BaseEmpty },
		setup() {
			const variants = ['default', 'ghost', 'soft'] as const
			return { args, variants }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<BaseEmpty
					v-for="v in variants"
					:key="v"
					v-bind="args"
					:variant="v"
					:title="'Вариант ' + v"
					:description="'Демонстрация пустого состояния в варианте ' + v"
				/>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Вариант default')).toBeInTheDocument()
		expect(canvas.getByText('Вариант ghost')).toBeInTheDocument()
		expect(canvas.getByText('Вариант soft')).toBeInTheDocument()
	},
}
/** Использование слотов */
export const WithSlots: Story = {
	render: args => ({
		components: { BaseEmpty, BaseButton },
		setup() {
			const handleAction = fn()
			return { args, handleAction }
		},
		template: `
			<BaseEmpty v-bind="args" title="Поиск не дал результатов">
				<template #icon>
					<div style="font-size: 48px; line-height: 1;">🔍</div>
				</template>
				<template #default>
					Мы обыскали весь замок, но не нашли ничего похожего на <strong>"экскалибур"</strong>.
				</template>
				<template #actions>
					<BaseButton @click="handleAction" :size-scale="90" variant="outline">
						Сбросить фильтры
					</BaseButton>
				</template>
			</BaseEmpty>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Поиск не дал результатов')).toBeInTheDocument()
		expect(canvas.getByText('экскалибур', { exact: false })).toBeInTheDocument()

		const button = canvas.getByText('Сбросить фильтры')
		expect(button).toBeInTheDocument()
		await userEvent.click(button)
	},
}
/** Масштабирование sizeScale */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseEmpty, BaseText },
		setup() {
			const scales = [75, 100, 150]
			return { args, scales }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:32px;">
				<div v-for="s in scales" :key="s">
					<BaseText tag="p" size="xs" style="margin-bottom:8px;color:var(--color-text-muted);">Масштаб {{ s }}%</BaseText>
					<BaseEmpty v-bind="args" :size-scale="s" :title="'Масштаб ' + s + '%'" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const empties = canvasElement.querySelectorAll('.base-empty')
		expect(empties).toHaveLength(3)
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template:
				'<div data-theme="dark" style="padding: 24px; background: var(--color-bg); border-radius: 8px;"><story /></div>',
		}),
	],
	args: {
		title: 'Корзина пуста',
		description: 'Добавьте товары в корзину, чтобы продолжить оформление заказа.',
		icon: 'shopping-cart',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Корзина пуста')).toBeInTheDocument()
	},
}
/** Без указания icon — покрывает ложную ветку `props.icon || 'inbox'` (используется fallback) */
export const DefaultIcon: Story = {
	args: {
		title: 'Без иконки',
		description: 'Используется иконка по умолчанию',
		icon: '',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Без иконки')).toBeInTheDocument()
		const iconWrapper = canvasElement.querySelector('.base-empty__icon-wrapper')
		expect(iconWrapper).toBeInTheDocument()
	},
}
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'emp-root', iconWrapper: 'emp-iconWrapper', icon: 'emp-icon', content: 'emp-content', title: 'emp-title', description: 'emp-description', body: 'emp-body', actions: 'emp-actions' },
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.emp-root')).toBeTruthy()
	},
}
