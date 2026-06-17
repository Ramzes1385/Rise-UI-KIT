/**
 * Stories для компонента BaseAlert.
 * Демонстрирует все типы оповещений, варианты отображения, интерактивные состояния и слоты.
 */

import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import BaseButton from '@components/BaseButton/ui/BaseButton.vue'
import { BaseText } from '@components/BaseText'
import { buildArgTypes } from '@utils/storybookUtils'
import BaseAlert from '../ui/BaseAlert.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseAlert> = {
	title: 'UI/BaseAlert',
	component: BaseAlert,

	argTypes: buildArgTypes({
		props: {
			type: {
				control: 'select',
				options: ['info', 'success', 'warning', 'error'],
				description: 'Тип оповещения',
			},
			variant: {
				control: 'select',
				options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
				description: 'Вариант визуального оформления',
			},
			title: {
				control: 'text',
				description: 'Заголовок оповещения',
			},
			description: {
				control: 'text',
				description: 'Текст описания',
			},
			isClosable: {
				control: 'boolean',
				description: 'Отображать ли кнопку закрытия',
			},
			icon: {
				control: 'text',
				description: 'Кастомная иконка',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%)',
			},
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
		},
	}),

	args: {
		type: 'info',
		variant: 'default',
		title: 'Информация',
		description: 'Это важное информационное сообщение.',
		isClosable: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseAlert>
/** Базовый алерт */
export const Default: Story = {
	args: {
		onClose: fn(),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Информация')).toBeInTheDocument()
		expect(canvas.getByText('Это важное информационное сообщение.')).toBeInTheDocument()
	},
}
/** Все типы оповещений */
export const AllTypes: Story = {
	render: args => ({
		components: { BaseAlert },
		setup() {
			const types = ['info', 'success', 'warning', 'error'] as const
			return { args, types }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<BaseAlert
					v-for="t in types"
					:key="t"
					v-bind="args"
					:type="t"
					:title="t.toUpperCase()"
					:description="'Это оповещение типа ' + t"
				/>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('INFO')).toBeInTheDocument()
		expect(canvas.getByText('SUCCESS')).toBeInTheDocument()
		expect(canvas.getByText('WARNING')).toBeInTheDocument()
		expect(canvas.getByText('ERROR')).toBeInTheDocument()
	},
}
/** Все варианты оформления */
export const Variants: Story = {
	render: args => ({
		components: { BaseAlert },
		setup() {
			const variants = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const
			return { args, variants }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<BaseAlert
					v-for="v in variants"
					:key="v"
					v-bind="args"
					:variant="v"
					:title="'Вариант ' + v"
					description="Демонстрация различных вариантов визуального оформления."
				/>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Вариант default')).toBeInTheDocument()
		expect(canvas.getByText('Вариант soft')).toBeInTheDocument()
	},
}
/** Закрываемый алерт */
export const Closable: Story = {
	args: {
		isClosable: true,
		onClose: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement)
		const closeButton = canvasElement.querySelector('.base-alert__close') as HTMLElement
		expect(closeButton).toBeInTheDocument()
		await userEvent.click(closeButton)
		await waitFor(() => expect(args.onClose).toHaveBeenCalled())
	},
}
/** Слоты */
export const WithSlots: Story = {
	render: args => ({
		components: { BaseAlert, BaseButton },
		setup() {
			return { args }
		},
		template: `
			<BaseAlert v-bind="args" title="Обновление системы">
				<template #default>
					Доступна новая версия системы. Пожалуйста, ознакомьтесь со списком изменений перед обновлением.
				</template>
				<template #actions>
					<div style="display:flex;gap:8px;margin-top:8px;">
						<BaseButton :size-scale="85" variant="outline">Позже</BaseButton>
						<BaseButton :size-scale="85">Обновить</BaseButton>
					</div>
				</template>
			</BaseAlert>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Обновление системы')).toBeInTheDocument()
		expect(canvas.getByText('Обновить')).toBeInTheDocument()
		expect(canvas.getByText('Позже')).toBeInTheDocument()
	},
}
/** Масштабирование sizeScale */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseAlert, BaseText },
		setup() {
			const scales = [75, 100, 150]
			return { args, scales }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div v-for="s in scales" :key="s">
					<BaseText tag="p" size="xs" style="margin-bottom:8px;">Масштаб {{ s }}%</BaseText>
					<BaseAlert v-bind="args" :size-scale="s" :title="'Масштаб ' + s + '%'" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const alerts = canvasElement.querySelectorAll('.base-alert')
		expect(alerts).toHaveLength(3)
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	args: {
		type: 'success',
		title: 'Успешно',
		description: 'Операция выполнена успешно в тёмной теме.',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Успешно')).toBeInTheDocument()
	},
}
/** Кастомная иконка */
export const CustomIcon: Story = {
	args: {
		icon: 'star',
		title: 'Кастомная иконка',
		description: 'Это оповещение с кастомной иконкой.',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Кастомная иконка')).toBeInTheDocument()
	},
}
/** Без заголовка и описания */
export const NoTitleOrDescription: Story = {
	args: {
		title: '',
		description: '',
	},
	play: async ({ canvasElement }) => {
		const alert = canvasElement.querySelector('.base-alert')
		expect(alert).toBeInTheDocument()
		const titleEl = canvasElement.querySelector('.base-alert__title')
		expect(titleEl).not.toBeInTheDocument()
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		title: 'Кастомный цвет',
		description: 'Это оповещение с кастомным цветом.',
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
/** Неизвестный тип оповещения */
export const UnknownType: Story = {
	args: {
		// @ts-expect-error - Тестируем неизвестный тип для покрытия дефолтной ветки иконки
		type: 'custom',
		title: 'Неизвестный тип',
		description: 'Это оповещение с неизвестным типом.',
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('Неизвестный тип')).toBeInTheDocument()
	},
}
/** Длинный контент — проверка a11y-дерева с длинным текстом */
export const LongContent: Story = {
	args: {
		title:
			'Очень длинный заголовок оповещения который превышает двести символов для проверки того что a11y-дерево корректно обрабатывает длинный контент без усечения и без потери семантики при переполнении контента внутри компонента оповещения',
		description:
			'Очень длинное описание оповещения которое превышает триста символов и предназначено для проверки того что компонент корректно обрабатывает длинный контент без потери семантики и доступности в a11y-дереве а также что текст не обрезается и остаётся полностью доступным для вспомогательных технологий и скринридеров при чтении длинных сообщений внутри оповещения',
	},
	play: async ({ canvasElement }) => {
		const title = canvasElement.querySelector('.base-alert__title')
		expect(title).toBeInTheDocument()
		expect(title?.textContent?.length).toBeGreaterThan(200)
		const desc = canvasElement.querySelector('.base-alert__description')
		expect(desc?.textContent?.length).toBeGreaterThan(300)
	},
}
