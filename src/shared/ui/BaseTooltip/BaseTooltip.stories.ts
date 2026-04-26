/**
 * Stories для компонента BaseTooltip.
 * Демонстрирует все позиции, варианты и состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseTooltip from './BaseTooltip.vue'

import { TOOLTIP_VARIANTS } from './BaseTooltip.types'

const meta: Meta<typeof BaseTooltip> = {
	title: 'UI/BaseTooltip',
	component: BaseTooltip,

	argTypes: {
		text: { control: 'text' },
		position: {
			control: 'inline-radio',
			options: ['top', 'bottom', 'left', 'right'],
		},
		variant: {
			control: 'inline-radio',
			options: TOOLTIP_VARIANTS,
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isAlwaysVisible: { control: 'boolean' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
	},

	args: {
		text: 'Подсказка',
		position: 'top',
		variant: 'default',
		isAlwaysVisible: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseTooltip>

/** Базовая подсказка */
export const Default: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
						Наведите
					</span>
				</BaseTooltip>
			</div>
		`,
	}),
}

/** Все позиции */
export const Positions: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:80px;display:flex;gap:24px;justify-content:center;">
				<BaseTooltip v-bind="args" position="top" text="Сверху">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Top</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" position="bottom" text="Снизу">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Bottom</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" position="left" text="Слева">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Left</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" position="right" text="Справа">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Right</span>
				</BaseTooltip>
			</div>
		`,
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:80px;display:flex;gap:24px;justify-content:center;flex-wrap:wrap;">
				<BaseTooltip v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-bind="args"
					:variant="v"
					:text="'Variant: ' + v"
				>
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">{{ v }}</span>
				</BaseTooltip>
			</div>
		`,
	}),
}

/** Всегда видима */
export const AlwaysVisible: Story = {
	args: {
		isAlwaysVisible: true,
	},
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">
						Всегда видима
					</span>
				</BaseTooltip>
			</div>
		`,
	}),
}

/** Многострочный текст */
export const Multiline: Story = {
	args: {
		text: 'Первая строка подсказки\nВторая строка подсказки\nТретья строка подсказки',
	},
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
						Наведите для многострочного текста
					</span>
				</BaseTooltip>
			</div>
		`,
	}),
}

/** Масштаб размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:80px;display:flex;gap:24px;justify-content:center;align-items:center;">
				<BaseTooltip v-bind="args" :size-scale="75" text="Масштаб 75%">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">75%</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" :size-scale="100" text="Масштаб 100%">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">100%</span>
				</BaseTooltip>
				<BaseTooltip v-bind="args" :size-scale="150" text="Масштаб 150%">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">150%</span>
				</BaseTooltip>
			</div>
		`,
	}),
}

/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		color: { bg: { base: '#1a7a3a' }, text: { base: '#ffffff' } },
	},
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:60px;display:flex;justify-content:center;">
				<BaseTooltip v-bind="args">
					<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
						Кастомный цвет
					</span>
				</BaseTooltip>
			</div>
		`,
	}),
}

/** Все варианты × все позиции */
export const AllCombinations: Story = {
	render: args => ({
		components: { BaseTooltip },
		setup() {
			return { args }
		},
		template: `
			<div style="padding:40px;">
				<div v-for="variant in ['default','ghost','outline','shadow','soft']" :key="variant" style="margin-bottom:32px;">
					<h4 style="margin-bottom:12px;">{{ variant }}</h4>
					<div style="display:flex;gap:24px;justify-content:center;flex-wrap:wrap;">
						<BaseTooltip v-bind="args" :variant="variant" position="top" :text="variant + ' top'">
							<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Top</span>
						</BaseTooltip>
						<BaseTooltip v-bind="args" :variant="variant" position="bottom" :text="variant + ' bottom'">
							<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Bottom</span>
						</BaseTooltip>
						<BaseTooltip v-bind="args" :variant="variant" position="left" :text="variant + ' left'">
							<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Left</span>
						</BaseTooltip>
						<BaseTooltip v-bind="args" :variant="variant" position="right" :text="variant + ' right'">
							<span style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">Right</span>
						</BaseTooltip>
					</div>
				</div>
			</div>
		`,
	}),
}
