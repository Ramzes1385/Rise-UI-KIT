/**
 * Stories для компонента BaseBreadcrumbs.
 * Демонстрирует все вариации: размеры, разделители, collapsed, home.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import { BaseText } from '@/shared/ui/BaseText'

import type { BreadcrumbItem } from './BaseBreadcrumbs.types'
import BaseBreadcrumbs from './BaseBreadcrumbs.vue'

const ITEMS: BreadcrumbItem[] = [
	{ label: 'Главная', to: '/' },
	{ label: 'Каталог', to: '/catalog' },
	{ label: 'Кованые изделия', to: '/catalog/forged' },
	{ label: 'Ворота', to: '/catalog/forged/gates' },
	{ label: 'Распашные ворота' },
]

const SHORT_ITEMS: BreadcrumbItem[] = [{ label: 'Главная', to: '/' }, { label: 'О компании' }]

const meta: Meta<typeof BaseBreadcrumbs> = {
	title: 'UI/BaseBreadcrumbs',
	component: BaseBreadcrumbs,

	argTypes: {
		separator: {
			control: 'select',
			options: ['slash', 'chevron', 'dot', 'arrow'],
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		maxItems: {
			control: 'number',
		},
		showHome: {
			control: 'boolean',
		},
		homeIcon: {
			control: 'text',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		class: { table: { disable: true } },
		style: { table: { disable: true } },
		key: { table: { disable: true } },
		ref: { table: { disable: true } },
	},

	args: {
		items: ITEMS,
		separator: 'chevron',
		variant: 'default',
		maxItems: 0,
		showHome: false,
		homeIcon: 'chevron-left',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseBreadcrumbs>

/** Базовая story */
export const Default: Story = {}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseBreadcrumbs, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">{{ v }}</BaseText>
					<BaseBreadcrumbs v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
}

/** Масштабирование размера */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseBreadcrumbs },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<BaseBreadcrumbs v-bind="args" :size-scale="75" />
				<BaseBreadcrumbs v-bind="args" :size-scale="100" />
				<BaseBreadcrumbs v-bind="args" :size-scale="150" />
			</div>
		`,
	}),
}

/** Разделители */
export const Separators: Story = {
	render: args => ({
		components: { BaseBreadcrumbs, BaseText },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">chevron</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="chevron" />
				</div>
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">slash</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="slash" />
				</div>
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">dot</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="dot" />
				</div>
				<div>
					<BaseText tag="p" size="xs" style="margin-bottom:4px;">arrow</BaseText>
					<BaseBreadcrumbs v-bind="args" separator="arrow" />
				</div>
			</div>
		`,
	}),
}

/** С иконкой дома */
export const WithHome: Story = {
	args: {
		showHome: true,
	},
}

/** Сокращённые крошки */
export const Collapsed: Story = {
	args: {
		maxItems: 2,
	},
}

/** Короткий путь */
export const Short: Story = {
	args: {
		items: SHORT_ITEMS,
	},
}

/** С иконками */
export const WithIcons: Story = {
	args: {
		items: [
			{ label: 'Главная', to: '/', icon: 'chevron-left' },
			{ label: 'Каталог', to: '/catalog', icon: 'search' },
			{ label: 'Кованые изделия', to: '/catalog/forged', icon: 'attach' },
			{ label: 'Ворота' },
		],
	},
}

/** Иконки + дом */
export const WithIconsAndHome: Story = {
	args: {
		showHome: true,
		items: [
			{ label: 'Каталог', to: '/catalog', icon: 'search' },
			{ label: 'Кованые изделия', to: '/catalog/forged', icon: 'attach' },
			{ label: 'Ворота' },
		],
	},
}

/** Принудительное hover-состояние */
export const HoverState: Story = {
	render: () => ({
		components: { BaseBreadcrumbs },
		setup() {
			return { items: ITEMS }
		},
		template: `<BaseBreadcrumbs :items="items" class="base-breadcrumbs--hover" />`,
	}),
}

/** Принудительное focus-состояние */
export const FocusState: Story = {
	render: () => ({
		components: { BaseBreadcrumbs },
		setup() {
			return { items: ITEMS }
		},
		template: `<BaseBreadcrumbs :items="items" class="base-breadcrumbs--focus" />`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseBreadcrumbs, BaseText },
		setup() {
			return { items: ITEMS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;">
				<div>
					<BaseText tag="p" size="xs">Normal</BaseText>
					<BaseBreadcrumbs :items="items" />
				</div>
				<div>
					<BaseText tag="p" size="xs">Hover</BaseText>
					<BaseBreadcrumbs :items="items" class="base-breadcrumbs--hover" />
				</div>
				<div>
					<BaseText tag="p" size="xs">Focus</BaseText>
					<BaseBreadcrumbs :items="items" class="base-breadcrumbs--focus" />
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
}

/** Интерактивная */
export const Interactive: Story = {}
