/**
 * Stories для компонента BaseBadge.
 * Демонстрирует все варианты цветов, размеры и интерактивные состояния.
 */

import { expect, fn, userEvent, within } from 'storybook/test'
import { BaseText } from '@components/BaseText'
import { buildArgTypes } from '@utils/storybookUtils'
import { BADGE_VARIANTS } from '../model/BaseBadge.types'
import BaseBadge from '../ui/BaseBadge.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

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
			customClass: { control: 'object' },
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
/** Базовый бейдж */
export const Default: Story = {
	parameters: {
		docs: {
			source: {
				code: '<BaseBadge label="Бейдж" />',
			},
		},
	},
	render: args => ({
		components: { BaseBadge },
		setup() {
			return { args }
		},
		template: '<BaseBadge v-bind="args" />',
	}),
	args: {
		onClick: fn(),
	},
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement)
		const badge = canvas.getByText('Бейдж')
		await userEvent.click(badge)
		expect(args.onClick).toHaveBeenCalled()
	},
}
/** Слот по умолчанию */
export const WithSlot: Story = {
	render: args => ({
		components: { BaseBadge },
		setup() {
			return { args }
		},
		template: `
			<BaseBadge v-bind="args">
				<span>Кастомный контент в слоте</span>
			</BaseBadge>
		`,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const content = canvas.getByText('Кастомный контент в слоте')
		expect(content).toBeInTheDocument()
	},
}
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		label: 'Кастомный цвет',
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
		const badge = canvas.getByText('Кастомный цвет')
		expect(badge).toBeInTheDocument()
	},
}
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
	play: async ({ canvasElement }) => {
		const badges = canvasElement.querySelectorAll('.base-badge')
		expect(badges.length).toBe(BADGE_VARIANTS.length)
	},
}
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
	play: async ({ canvasElement }) => {
		const badges = canvasElement.querySelectorAll('.base-badge')
		expect(badges.length).toBe(BADGE_VARIANTS.length)
	},
}
/** Кастомные CSS-классы через customClass */
export const WithCustomClass: Story = {
	args: {
		customClass: { root: 'bdg-root', text: 'bdg-text' },
	},
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('.bdg-root')).toBeTruthy()
	},
}
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
	play: async ({ canvasElement }) => {
		const badges = canvasElement.querySelectorAll('.base-badge')
		expect(badges.length).toBe(4)
	},
}
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
	play: async ({ canvasElement }) => {
		const badges = canvasElement.querySelectorAll('.base-badge')
		expect(badges.length).toBe(BADGE_VARIANTS.length)
	},
}
