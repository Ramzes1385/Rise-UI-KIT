/**
 * Stories для компонента BaseButton.
 * Демонстрирует все вариации, состояния, слоты и интерактивные состояния.
 */

import { expect, fn, userEvent, within } from 'storybook/test'
import { buildArgTypes } from '@utils/storybookUtils'
import { BUTTON_TYPES, BUTTON_VARIANTS } from '../model/BaseButton.types'
import BaseButton from '../ui/BaseButton.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseButton> = {
	title: 'UI/BaseButton',
	component: BaseButton,

	argTypes: buildArgTypes({
		props: {
			type: {
				control: 'inline-radio',
				options: BUTTON_TYPES,
			},
			variant: {
				control: 'radio',
				options: BUTTON_VARIANTS,
			},
			padding: {
				control: 'object',
				description:
					'Отступы. Число (px): Y = значение, X = значение × 2. Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси. По умолчанию 10 → 10px 20px',
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фон), text (текст) и их состояния hover/active/focus',
			},
			isLoading: {
				control: 'boolean',
			},
			isDisabled: {
				control: 'boolean',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			default: {
				control: 'text',
				description: 'Контент кнопки (слот)',
			},
			left: {
				table: { disable: true },
			},
			right: {
				table: { disable: true },
			},
			onClick: {
				table: { disable: true },
			},
		},
	}),

	args: {
		type: 'button',
		variant: 'default',
		padding: 10,
		isLoading: false,
		isDisabled: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseButton>
/** Базовая кнопка с обработчиком клика */
export const Default: Story = {
	args: {
		default: 'Кнопка',
		onClick: fn(),
	},
	play: async ({ canvasElement, args, step }) => {
		await step('Фокусировка кнопки по Tab', async () => {
			await userEvent.tab()
		})
		const canvas = within(canvasElement)
		const button = canvas.getByRole('button', { name: 'Кнопка' })
		await userEvent.click(button)
		expect(args.onClick).toHaveBeenCalled()
	},
}
/** Все визуальные варианты: default, ghost, outline, shadow, soft */
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton variant="default">default</BaseButton>\n<BaseButton variant="ghost">ghost</BaseButton>\n<BaseButton variant="outline">outline</BaseButton>\n<BaseButton variant="shadow">shadow</BaseButton>\n<BaseButton variant="soft">soft</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			return { args, variants: BUTTON_VARIANTS }
		},
		template: `
			<div style="display: flex; gap: 12px; align-items: center;">
				<BaseButton v-for="v in variants"
					:key="v"
					v-bind="args"
					:variant="v"
				>
					{{ v }}
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		for (const v of BUTTON_VARIANTS) {
			expect(canvas.getByText(v)).toBeInTheDocument()
		}
	},
}
/** HTML-типы кнопки: button, submit, reset */
export const ButtonTypes: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton type="button">button</BaseButton>\n<BaseButton type="submit">submit</BaseButton>\n<BaseButton type="reset">reset</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			return { args, types: BUTTON_TYPES }
		},
		template: `
			<div style="display: flex; gap: 12px; align-items: center;">
				<BaseButton v-for="t in types" :key="t" v-bind="args" :type="t">
					{{ t }}
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		for (const t of BUTTON_TYPES) {
			expect(canvas.getByText(t)).toBeInTheDocument()
		}
	},
}
/** Кнопка с иконкой в левом слоте */
export const WithLeftSlot: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton>\n  <template #left>💾</template>\n  Сохранить\n</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			return { args }
		},
		template: `
			<BaseButton v-bind="args">
				<template #left>💾</template>
				{{ args.default }}
			</BaseButton>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('💾')).toBeInTheDocument()
	},
}
/** Кнопка с иконкой в правом слоте */
export const WithRightSlot: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton>\n  Далее\n  <template #right>→</template>\n</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			return { args }
		},
		template: `
			<BaseButton v-bind="args">
				{{ args.default }}
				<template #right>→</template>
			</BaseButton>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('→')).toBeInTheDocument()
	},
}
/** Кнопка с иконками в обоих слотах */
export const WithBothSlots: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton>\n  <template #left>📤</template>\n  Отправить\n  <template #right>✓</template>\n</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			return { args }
		},
		template: `
			<BaseButton v-bind="args">
				<template #left>📤</template>
				{{ args.default }}
				<template #right>✓</template>
			</BaseButton>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('📤')).toBeInTheDocument()
		expect(canvas.getByText('✓')).toBeInTheDocument()
	},
}
/** Слоты left/right во всех вариантах */
export const SlotsAllVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton v-for="v in variants" :key="v" :variant="v">\n  <template #left>💾</template>\n  {{ v }}\n  <template #right>→</template>\n</BaseButton>`,
			},
		},
	},
	render: () => ({
		components: { BaseButton },
		setup() {
			return { variants: BUTTON_VARIANTS }
		},
		template: `
			<div style="display: flex; gap: 12px; align-items: center;">
				<BaseButton v-for="v in variants"
					:key="v"
					:variant="v"
				>
					<template #left>💾</template>
					{{ v }}
					<template #right>→</template>
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const leftSlots = canvasElement.querySelectorAll('.base-button__slot-left')
		const rightSlots = canvasElement.querySelectorAll('.base-button__slot-right')
		expect(leftSlots).toHaveLength(BUTTON_VARIANTS.length)
		expect(rightSlots).toHaveLength(BUTTON_VARIANTS.length)
	},
}
/** Поведение при длинном тексте во всех вариантах */
export const LongText: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton>Очень длинный текст кнопки для проверки</BaseButton>`,
			},
		},
	},
	args: {
		default: 'Очень длинный текст кнопки для проверки',
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			return { args, variants: BUTTON_VARIANTS }
		},
		template: `
			<div style="display: flex; gap: 12px; flex-direction: column; max-width: 300px;">
				<BaseButton v-for="v in variants"
					:key="v"
					v-bind="args"
					:variant="v"
				>
					{{ args.default }}
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const buttons = canvasElement.querySelectorAll('.base-button')
		expect(buttons).toHaveLength(BUTTON_VARIANTS.length)
	},
}
/** Короткий текст и иконки-символы */
export const ShortText: Story = {
	render: () => ({
		components: { BaseButton },
		template: `
			<div style="display: flex; gap: 12px; align-items: center;">
				<BaseButton variant="default">OK</BaseButton>
				<BaseButton variant="ghost">✓</BaseButton>
				<BaseButton variant="outline">✕</BaseButton>
				<BaseButton variant="soft">+</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		expect(canvas.getByText('OK')).toBeInTheDocument()
		expect(canvas.getByText('✓')).toBeInTheDocument()
		expect(canvas.getByText('✕')).toBeInTheDocument()
		expect(canvas.getByText('+')).toBeInTheDocument()
	},
}
/** Отключённое состояние — клик не срабатывает */
export const Disabled: Story = {
	args: {
		isDisabled: true,
		default: 'Отключена',
		onClick: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)
		const button = canvas.getByRole('button', { name: 'Отключена' })
		// Пытаемся кликнуть, но событие не должно сработать
		await userEvent.click(button)
		expect(args.onClick).not.toHaveBeenCalled()
	},
}
/** Состояние загрузки — показан лоадер, клик заблокирован */
export const Loading: Story = {
	args: {
		isLoading: true,
		default: 'Загрузка',
		onClick: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)
		const button = canvas.getByRole('button')
		// Пытаемся кликнуть, но событие не должно сработать
		await userEvent.click(button)
		expect(args.onClick).not.toHaveBeenCalled()
		expect(canvasElement.querySelector('.base-button__loader')).toBeInTheDocument()
	},
}
/** Все варианты в состоянии загрузки */
export const LoadingVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton v-for="v in variants" :key="v" :variant="v" is-loading>{{ v }}</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			return { args, variants: BUTTON_VARIANTS }
		},
		template: `
			<div style="display: flex; gap: 12px; align-items: center;">
				<BaseButton v-for="v in variants"
					:key="v"
					v-bind="args"
					:variant="v"
					is-loading
				>
					{{ v }}
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const loaders = canvasElement.querySelectorAll('.base-button__loader')
		expect(loaders).toHaveLength(BUTTON_VARIANTS.length)
	},
}
/** все варианты в отключенном состоянии */
export const DisabledVariants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton v-for="v in variants" :key="v" :variant="v" is-disabled>{{ v }}</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			return { args, variants: BUTTON_VARIANTS }
		},
		template: `
			<div style="display: flex; gap: 12px; align-items: center;">
				<BaseButton v-for="v in variants"
					:key="v"
					v-bind="args"
					:variant="v"
					is-disabled
				>
					{{ v }}
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const disabledButtons = canvasElement.querySelectorAll('.base-button--disabled')
		expect(disabledButtons).toHaveLength(BUTTON_VARIANTS.length)
	},
}
/** Отключенная + загрузка */
export const DisabledLoading: Story = {
	args: {
		isDisabled: true,
		isLoading: true,
		default: 'Отключена + загрузка',
		onClick: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)
		const button = canvas.getByRole('button')
		await userEvent.click(button)
		expect(args.onClick).not.toHaveBeenCalled()
		expect(canvasElement.querySelector('.base-button__loader')).toBeInTheDocument()
	},
}
/** все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseButton },
		setup() {
			return { variants: BUTTON_VARIANTS }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px;">
				<div style="display: flex; gap: 12px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">Normal</span>
					<BaseButton v-for="v in variants" :key="v" :variant="v">{{ v }}</BaseButton>
				</div>
				<div style="display: flex; gap: 12px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">Hover</span>
					<BaseButton v-for="v in variants" :key="'h-'+v" :variant="v" class="base-button--hover">{{ v }}</BaseButton>
				</div>
				<div style="display: flex; gap: 12px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">Active</span>
					<BaseButton v-for="v in variants" :key="'a-'+v" :variant="v" class="base-button--active">{{ v }}</BaseButton>
				</div>
				<div style="display: flex; gap: 12px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">Focus</span>
					<BaseButton v-for="v in variants" :key="'f-'+v" :variant="v" class="base-button--focus">{{ v }}</BaseButton>
				</div>
				<div style="display: flex; gap: 12px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">Disabled</span>
					<BaseButton v-for="v in variants" :key="'d-'+v" :variant="v" is-disabled>{{ v }}</BaseButton>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll('.base-button')
		expect(buttons).toHaveLength(BUTTON_VARIANTS.length * 5)
	},
}
/** Все варианты в тёмной теме */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseButton },
		setup() {
			return { variants: BUTTON_VARIANTS }
		},
		template: `
			<div style="display: flex; gap: 12px; align-items: center;">
				<BaseButton v-for="v in variants"
					:key="v"
					:variant="v"
				>
					{{ v }}
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		for (const v of BUTTON_VARIANTS) {
			expect(canvas.getByText(v)).toBeInTheDocument()
		}
	},
}
/** Масштабирование размера через sizeScale (0.75×–1.5×) */
export const SizeScale: Story = {
	render: () => ({
		components: { BaseButton },
		setup() {
			return { variants: BUTTON_VARIANTS }
		},
		template: `
			<div style="display: flex; flex-direction: column; gap: 16px; align-items: flex-start;">
				<div style="display: flex; gap: 12px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">0.75×</span>
					<BaseButton v-for="v in variants" :key="'s075-'+v" :variant="v" :size-scale="75">{{ v }}</BaseButton>
				</div>
				<div style="display: flex; gap: 12px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">1×</span>
					<BaseButton v-for="v in variants" :key="'s1-'+v" :variant="v">{{ v }}</BaseButton>
				</div>
				<div style="display: flex; gap: 12px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">1.25×</span>
					<BaseButton v-for="v in variants" :key="'s125-'+v" :variant="v" :size-scale="125">{{ v }}</BaseButton>
				</div>
				<div style="display: flex; gap: 12px; align-items: center;">
					<span style="width: 60px; font-size: 12px; color: var(--color-text-muted);">1.5×</span>
					<BaseButton v-for="v in variants" :key="'s15-'+v" :variant="v" :size-scale="150">{{ v }}</BaseButton>
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll('.base-button')
		expect(buttons).toHaveLength(BUTTON_VARIANTS.length * 4)
	},
}
/** Разные значения внутренних отступов (padding) */
export const Paddings: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton :padding="0">0</BaseButton>\n<BaseButton :padding="4">4</BaseButton>\n<BaseButton :padding="6">6</BaseButton>\n<BaseButton :padding="10">10</BaseButton>\n<BaseButton :padding="14">14</BaseButton>\n<BaseButton :padding="18">18</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			const paddings = [0, 4, 6, 10, 14, 18]
			return { args, paddings }
		},
		template: `
			<div style="display: flex; gap: 12px; align-items: center;">
				<BaseButton v-for="p in paddings" :key="p" v-bind="args" :padding="p">
					{{ p }}
				</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll('.base-button')
		expect(buttons).toHaveLength(6)
	},
}
/** Объектный padding: оси x/y и точечные стороны (left/right/top/bottom) */
export const ObjectPadding: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseButton :padding="{ x: 24, y: 8 }">x/y</BaseButton>\n<BaseButton :padding="{ x: 10, left: 32 }">left override</BaseButton>\n<BaseButton :padding="{ top: 4, right: 16, bottom: 20, left: 8 }">все стороны</BaseButton>`,
			},
		},
	},
	render: args => ({
		components: { BaseButton },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
				<BaseButton v-bind="args" :padding="{ x: 24, y: 8 }">x/y</BaseButton>
				<BaseButton v-bind="args" :padding="{ x: 10, left: 32 }">left override</BaseButton>
				<BaseButton v-bind="args" :padding="{ top: 4, right: 16, bottom: 20, left: 8 }">все стороны</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll('.base-button')
		expect(buttons).toHaveLength(3)
		const overrideButton = buttons[1] as HTMLElement
		expect(overrideButton.style.getPropertyValue('--btn-pad-left')).toBe('32px')
		expect(overrideButton.style.getPropertyValue('--btn-pad-right')).toBe('10px')
	},
}
/** Интерактивная кнопка для проверки клика */
export const Interactive: Story = {
	args: {
		default: 'Интерактивная кнопка',
		onClick: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)
		const button = canvas.getByRole('button', { name: 'Интерактивная кнопка' })
		await userEvent.click(button)
		expect(args.onClick).toHaveBeenCalled()
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		default: 'Кастомный цвет',
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
