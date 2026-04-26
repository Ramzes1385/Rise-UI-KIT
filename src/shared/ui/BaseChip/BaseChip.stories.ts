/**
 * Stories для компонента BaseChip.
 * Демонстрирует все вариации, размеры, позиции и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseChip from './BaseChip.vue'

const meta: Meta<typeof BaseChip> = {
	title: 'UI/BaseChip',
	component: BaseChip,

	argTypes: {
		content: { control: 'text' },
		placement: {
			control: 'inline-radio',
			options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isHiddenOnZero: { control: 'boolean' },
		hasOverflow: { control: 'boolean' },
		maxValue: { control: 'number' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		'onClick-badge': { table: { disable: true } },
		default: {
			control: 'text',
			description: 'Контент (слот)',
		},
	},

	args: {
		content: 5,
		placement: 'top-right',
		variant: 'default',
		isHiddenOnZero: false,
		hasOverflow: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseChip>

/** Базовый чип */
export const Default: Story = {
	args: {
		default: 'Уведомления',
	},
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseChip },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					v-bind="args"
					:variant="v"
					:content="3"
				>
					{{ v }}
				</BaseChip>
			</div>
		`,
	}),
}

/** Масштабирование размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseChip },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip v-bind="args" :size-scale="75" :content="3">75%</BaseChip>
				<BaseChip v-bind="args" :size-scale="100" :content="3">100%</BaseChip>
				<BaseChip v-bind="args" :size-scale="150" :content="3">150%</BaseChip>
			</div>
		`,
	}),
}

/** Все позиции */
export const Placements: Story = {
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;gap:24px;align-items:center;">
				<BaseChip v-for="p in ['top-right','top-left','bottom-right','bottom-left']"
					:key="p"
					:placement="p"
					:content="7"
				>
					{{ p }}
				</BaseChip>
			</div>
		`,
	}),
}

/** Текстовый контент */
export const TextContent: Story = {
	args: {
		content: 'New',
		default: 'Сообщения',
	},
}

/** С переполнением (+) */
export const WithOverflow: Story = {
	args: {
		content: 150,
		hasOverflow: true,
		maxValue: 99,
		default: 'Уведомления',
	},
}

/** С maxValue */
export const WithMaxValue: Story = {
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip :content="50" :max-value="9">max 9</BaseChip>
				<BaseChip :content="150" :max-value="99" has-overflow>max 99</BaseChip>
				<BaseChip :content="999" :max-value="999">max 999</BaseChip>
			</div>
		`,
	}),
}

/** Нулевое значение */
export const ZeroContent: Story = {
	args: {
		content: 0,
		default: 'Нет',
	},
}

/** Скрытие при нулевом значении */
export const HiddenOnZero: Story = {
	args: {
		content: 0,
		isHiddenOnZero: true,
		default: 'Скрыто при 0',
	},
}

/** Без контента (только слот) */
export const NoBadge: Story = {
	args: {
		default: 'Без бейджа',
	},
}

// ── Интерактивные состояния (hover / focus) ──

export const HoverState: Story = {
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip content="5" variant="default" class="base-chip--hover">default (hover)</BaseChip>
				<BaseChip content="5" variant="soft" class="base-chip--hover">soft (hover)</BaseChip>
			</div>
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip content="5" variant="default" class="base-chip--focus">default (focus)</BaseChip>
				<BaseChip content="5" variant="soft" class="base-chip--focus">soft (focus)</BaseChip>
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseChip content="5" variant="default">default</BaseChip>
					<BaseChip content="5" variant="soft">soft</BaseChip>
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseChip content="5" variant="default" class="base-chip--hover">default</BaseChip>
					<BaseChip content="5" variant="soft" class="base-chip--hover">soft</BaseChip>
				</div>
				<div style="display:flex;gap:16px;align-items:center;">
					<span style="width:60px;font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseChip content="5" variant="default" class="base-chip--focus">default</BaseChip>
					<BaseChip content="5" variant="soft" class="base-chip--focus">soft</BaseChip>
				</div>
			</div>
		`,
	}),
}

/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: () => ({
		components: { BaseChip },
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<BaseChip v-for="v in ['default','ghost','outline','shadow','soft']"
					:key="v"
					:variant="v"
					:content="3"
				>
					{{ v }}
				</BaseChip>
			</div>
		`,
	}),
}

/** Интерактивный */
export const Interactive: Story = {
	args: {
		default: 'Интерактивный',
	},
}
