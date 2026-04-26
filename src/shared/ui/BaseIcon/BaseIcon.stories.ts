/**
 * Stories для компонента BaseIcon.
 * Демонстрирует все размеры, трансформации, цвета и использование с иконками из спрайта.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseIcon from './BaseIcon.vue'

/** Список иконок из спрайта */
const ICON_NAMES = [
	'close',
	'check',
	'plus',
	'x-mark',
	'chevron-down',
	'chevron-up',
	'chevron-left',
	'chevron-right',
	'arrow-right',
	'arrow-left',
	'search',
	'menu',
	'attach',
	'mic',
	'send',
	'play',
	'pause',
	'reply',
	'sort',
	'sort-up',
	'sort-down',
]

const meta: Meta<typeof BaseIcon> = {
	title: 'UI/BaseIcon',
	component: BaseIcon,

	argTypes: {
		name: {
			control: 'select',
			options: ICON_NAMES,
		},
		size: {
			control: 'inline-radio',
			options: ['xs', 'sm', 'md', 'lg', 'xl'],
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		rotate: { control: 'number' },
		isFlipX: { control: 'boolean' },
		isFlipY: { control: 'boolean' },
		ariaLabel: { control: 'text' },
		class: { table: { disable: true } },
		style: { table: { disable: true } },
		key: { table: { disable: true } },
		ref: { table: { disable: true } },
	},

	args: {
		name: 'close',
		size: 'md',
		variant: 'default',
		rotate: 0,
		isFlipX: false,
		isFlipY: false,
		ariaLabel: '',
	},
}

export default meta
type Story = StoryObj<typeof BaseIcon>

/** Базовая иконка */
export const Default: Story = {}

/** Все размеры */
export const Sizes: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return { args, sizes: ['xs', 'sm', 'md', 'lg', 'xl'] as const }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseIcon v-for="s in sizes" :key="s" v-bind="args" :size="s" />
				<span style="margin-left:8px;font-size:12px;color:var(--color-text-muted);">xs → xl</span>
			</div>
		`,
	}),
}

/** Все иконки из спрайта */
export const AllIcons: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return { args, icons: ICON_NAMES }
		},
		template: `
			<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
				<div v-for="icon in icons" :key="icon" style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);">
					<BaseIcon v-bind="args" :name="icon" size="lg" />
					<span style="font-size:10px;color:var(--color-text-muted);word-break:break-all;">{{ icon }}</span>
				</div>
			</div>
		`,
	}),
}

/** Поворот иконки */
export const Rotate: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return { args, angles: [0, 45, 90, 180, 270] }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<div v-for="angle in angles" :key="angle" style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<BaseIcon v-bind="args" :rotate="angle" size="lg" />
					<span style="font-size:10px;color:var(--color-text-muted);">{{ angle }}°</span>
				</div>
			</div>
		`,
	}),
}

/** Отражение иконки */
export const Flip: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<BaseIcon v-bind="args" size="lg" />
					<span style="font-size:10px;color:var(--color-text-muted);">Оригинал</span>
				</div>
				<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<BaseIcon v-bind="args" size="lg" :is-flip-x="true" />
					<span style="font-size:10px;color:var(--color-text-muted);">FlipX</span>
				</div>
				<div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
					<BaseIcon v-bind="args" size="lg" :is-flip-y="true" />
					<span style="font-size:10px;color:var(--color-text-muted);">FlipY</span>
				</div>
			</div>
		`,
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseIcon v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-bind="args"
					:variant="v"
					size="lg"
				/>
			</div>
		`,
	}),
}

/** Цвет иконки */
export const WithColor: Story = {
	render: args => ({
		components: { BaseIcon },
		setup() {
			return {
				args,
				colors: ['var(--color-primary)', 'var(--color-accent)', 'var(--color-error)', 'var(--color-success)'],
			}
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseIcon v-for="c in colors" :key="c" v-bind="args" :color="{ text: { base: c } }" size="lg" />
			</div>
		`,
	}),
}

/** Доступность — иконка с aria-label */
export const WithAriaLabel: Story = {
	args: {
		ariaLabel: 'Закрыть',
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
		size: 'lg',
	},
}

/** Интерактивная */
export const Interactive: Story = {}
