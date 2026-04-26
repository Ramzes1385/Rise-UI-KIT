/**
 * Stories для компонента BaseSearch.
 * Демонстрирует все варианты.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseSearch from './BaseSearch.vue'

const meta: Meta<typeof BaseSearch> = {
	title: 'UI/BaseSearch',
	component: BaseSearch,

	argTypes: {
		placeholder: { control: 'text' },
		variant: {
			control: 'inline-radio',
			options: ['outline', 'filled', 'underline'],
		},
		size: {
			control: 'inline-radio',
			options: ['sm', 'md', 'lg'],
		},
		mode: {
			control: 'inline-radio',
			options: ['default', 'modal', 'sidebar'],
		},
		isDisabled: { control: 'boolean' },
		isLoading: { control: 'boolean' },
		hasIcon: { control: 'boolean' },
		hasClear: { control: 'boolean' },
	},

	args: {
		placeholder: 'Поиск...',
		variant: 'outline',
		size: 'md',
		mode: 'default',
		isDisabled: false,
		isLoading: false,
		hasIcon: true,
		hasClear: true,
	},
}

export default meta
type Story = StoryObj<typeof BaseSearch>

/** Базовый поиск */
export const Default: Story = {}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseSearch },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<BaseSearch v-bind="args" variant="outline" placeholder="outline" />
				<BaseSearch v-bind="args" variant="filled" placeholder="filled" />
				<BaseSearch v-bind="args" variant="underline" placeholder="underline" />
			</div>
		`,
	}),
}

/** В состоянии загрузки */
export const Loading: Story = {
	args: {
		isLoading: true,
	},
}

/** Отключенный */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
}

/** Модальный режим */
export const ModalMode: Story = {
	args: {
		mode: 'modal',
	},
}

/** Режим боковой панели */
export const SidebarMode: Story = {
	args: {
		mode: 'sidebar',
	},
}

/** Все режимы */
export const AllModes: Story = {
	render: args => ({
		components: { BaseSearch },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:400px;">
				<h4 style="margin:0;">default</h4>
				<BaseSearch v-bind="args" mode="default" />
				<h4 style="margin:0;">modal</h4>
				<BaseSearch v-bind="args" mode="modal" />
				<h4 style="margin:0;">sidebar</h4>
				<BaseSearch v-bind="args" mode="sidebar" />
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

/** Интерактивный */
export const Interactive: Story = {}
