/**
 * Stories для компонента BaseBadge.
 * Демонстрирует все варианты цветов, размеры и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import { BaseText } from '@/shared/ui/BaseText'
import { buildArgTypes } from '@/shared/utils/storybookUtils'

import { BADGE_VARIANTS } from './BaseBadge.types'
import BaseBadge from './BaseBadge.vue'

const meta: Meta<typeof BaseBadge> = {
	title: 'UI/BaseBadge',
	component: BaseBadge,

	argTypes: buildArgTypes({
		props: {
			label: {
				control: 'text',
				description: 'Текст бейджа',
			},
			variant: {
				control: 'inline-radio',
				options: BADGE_VARIANTS,
				description: 'Вариант отображения',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
			color: {
				control: 'object',
				description: 'Объект CustomColor: bg (фоновый цвет), text (цвет текста) и их состояния hover/active/focus',
			},
		},
	}),

	args: {
		label: 'Бейдж',
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseBadge>

// ── 1. Default ──

/** Базовый бейдж */
export const Default: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseBadge label="Бейдж" />',
			},
		},
	},
}

// ── 2. Variants ──

/** Все варианты цветов */
export const Variants: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseBadge v-for="v in ['primary','secondary','success','warning','error','info']" :key="v" :variant="v" :label="v" />`,
			},
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup() {
			return { args, variants: BADGE_VARIANTS }
		},
		template: `
			<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
				<BaseBadge v-for="v in variants" :key="v" v-bind="args" :variant="v" :label="v" />
			</div>
		`,
	}),
}

// ── 5. SizeScale ──

/** Масштабирование sizeScale */
export const SizeScale: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseBadge :size-scale="75" />
<BaseBadge :size-scale="100" />
<BaseBadge :size-scale="150" />`,
			},
		},
	},
	render: args => ({
		components: { BaseBadge, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale">
					<BaseText tag="p" size="sm" style="margin-bottom: 8px; color: var(--color-text-muted);">{{ scale }}%</BaseText>
					<BaseBadge v-bind="args" :size-scale="scale" />
				</div>
			</div>
		`,
	}),
}

// ── 6. HoverState ──

/** Принудительное hover-состояние */
export const HoverState: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseBadge label="Hover" class="base-badge--hover" />',
			},
		},
	},
	render: () => ({
		components: { BaseBadge },
		setup() {
			return {}
		},
		template: `<BaseBadge label="Hover" class="base-badge--hover" />`,
	}),
}

// ── 7. ActiveState ──

/** Принудительное active-состояние */
export const ActiveState: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseBadge label="Active" class="base-badge--active" />',
			},
		},
	},
	render: () => ({
		components: { BaseBadge },
		setup() {
			return {}
		},
		template: `<BaseBadge label="Active" class="base-badge--active" />`,
	}),
}

// ── 8. FocusState ──

/** Принудительное focus-состояние */
export const FocusState: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseBadge label="Focus" class="base-badge--focus" />',
			},
		},
	},
	render: () => ({
		components: { BaseBadge },
		setup() {
			return {}
		},
		template: `<BaseBadge label="Focus" class="base-badge--focus" />`,
	}),
}

// ── 9. InteractiveStates ──

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	parameters: {
		docs: {
			source: {
				code: `<BaseBadge label="Normal" />
<BaseBadge label="Hover" class="base-badge--hover" />
<BaseBadge label="Active" class="base-badge--active" />
<BaseBadge label="Focus" class="base-badge--focus" />`,
			},
		},
	},
	render: () => ({
		components: { BaseBadge, BaseText },
		setup() {
			return {}
		},
		template: `
			<div style="display:flex;gap:16px;align-items:center;">
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Normal</BaseText>
					<BaseBadge label="Normal" />
				</div>
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Hover</BaseText>
					<BaseBadge label="Hover" class="base-badge--hover" />
				</div>
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Active</BaseText>
					<BaseBadge label="Active" class="base-badge--active" />
				</div>
				<div style="text-align:center;">
					<BaseText tag="p" size="xs">Focus</BaseText>
					<BaseBadge label="Focus" class="base-badge--focus" />
				</div>
			</div>
		`,
	}),
}

// ── 10. DarkTheme ──

/** Тёмная тема */
export const DarkTheme: Story = {
	parameters: {
		docs: {
			source: {
				code: `<div data-theme="dark">
  <BaseBadge v-for="v in variants" :key="v" :variant="v" :label="v" />
</div>`,
			},
		},
	},
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	render: args => ({
		components: { BaseBadge },
		setup() {
			return { args, variants: BADGE_VARIANTS }
		},
		template: `
			<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
				<BaseBadge v-for="v in variants" :key="v" v-bind="args" :variant="v" :label="v" />
			</div>
		`,
	}),
}

// ── 11. Interactive ──

/** Интерактивная story с полными контролами */
export const Interactive: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseBadge :label="label" :variant="variant" :size-scale="sizeScale" />',
			},
		},
	},
}
