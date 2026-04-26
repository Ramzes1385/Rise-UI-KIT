/**
 * Stories для компонента BaseButton.
 * Демонстрирует все вариации, состояния, слоты и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import { buildArgTypes } from '@/shared/utils/storybookUtils'

import { BUTTON_TYPES, BUTTON_VARIANTS } from './BaseButton.types'
import BaseButton from './BaseButton.vue'

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
				control: { type: 'range', min: 0, max: 30, step: 1 },
				description: 'Базовый padding (px). Y = значение, X = значение × 2. По умолчанию 10 → 10px 20px',
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

// ── Базовая story ──

export const Default: Story = {
	args: {
		default: 'Кнопка',
	},
}

// ── Варианты ──

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
}

// ── Типы кнопок ──

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
}

// ── Слоты left / right ──

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
}

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
}

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
}

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
}

// ── Длинный текст ──

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
}

// ── Короткий текст ──

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
}

// ── Состояния ──

export const Disabled: Story = {
	args: {
		isDisabled: true,
		default: 'Отключена',
	},
}

export const Loading: Story = {
	args: {
		isLoading: true,
		default: 'Загрузка',
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
}

/** Все варианты в отключенном состоянии */
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
}

/** Отключенная + загрузка */
export const DisabledLoading: Story = {
	args: {
		isDisabled: true,
		isLoading: true,
		default: 'Отключена + загрузка',
	},
}

// ── Интерактивные состояния (hover / active / focus) ──

export const HoverState: Story = {
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
					class="base-button--hover"
				>
					{{ v }} (hover)
				</BaseButton>
			</div>
		`,
	}),
}

export const ActiveState: Story = {
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
					class="base-button--active"
				>
					{{ v }} (active)
				</BaseButton>
			</div>
		`,
	}),
}

export const FocusState: Story = {
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
					class="base-button--focus"
				>
					{{ v }} (focus)
				</BaseButton>
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
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
}

// ── Тёмная тема ──

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
}

// ── Масштабирование размера ──

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
}

// ── Настройка padding ──

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
}

// ── Интерактивная ──

export const Interactive: Story = {
	args: {
		default: 'Интерактивная кнопка',
	},
}
