/**
 * Stories для компонента BaseFileUpload.
 * Демонстрирует все вариации, состояния и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import BaseFileUpload from './BaseFileUpload.vue'

const meta: Meta<typeof BaseFileUpload> = {
	title: 'UI/BaseFileUpload',
	component: BaseFileUpload,

	argTypes: {
		accept: { control: 'text' },
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		isMultiple: { control: 'boolean' },
		isDisabled: { control: 'boolean' },
		maxSize: { control: 'number' },
		maxCount: { control: 'number' },
		label: { control: 'text' },
		buttonText: { control: 'text' },
		previewSize: { control: 'number' },
		allowPreview: { control: 'boolean' },
		emptyText: { control: 'text' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		onChange: { table: { disable: true } },
		onError: { table: { disable: true } },
		onRemove: { table: { disable: true } },
	},

	args: {
		accept: 'image/*',
		variant: 'default',
		isMultiple: false,
		isDisabled: false,
		maxSize: 10,
		label: 'Загрузите файл',
		buttonText: 'Выбрать файл',
		previewSize: 48,
		allowPreview: true,
		emptyText: 'Перетащите файл сюда',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseFileUpload>

/** Базовая загрузка */
export const Default: Story = {}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseFileUpload },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">Variant: {{ v }}</p>
					<BaseFileUpload v-bind="args" :variant="v" />
				</div>
			</div>
		`,
	}),
}

/** Множественная загрузка */
export const Multiple: Story = {
	args: {
		isMultiple: true,
		maxCount: 5,
	},
}

/** Только изображения */
export const ImagesOnly: Story = {
	args: {
		accept: 'image/png,image/jpeg,image/webp',
		buttonText: 'Выбрать изображение',
	},
}

/** Отключенная */
export const Disabled: Story = {
	args: {
		isDisabled: true,
	},
}

/** Без лейбла */
export const WithoutLabel: Story = {
	args: {
		label: '',
	},
}

/** С ограничением размера */
export const WithMaxSize: Story = {
	args: {
		maxSize: 2,
		buttonText: 'Выбрать файл (до 2 МБ)',
	},
}

/** Документы */
export const DocumentsOnly: Story = {
	args: {
		accept: '.pdf,.doc,.docx,.xls,.xlsx',
		buttonText: 'Выбрать документ',
		label: 'Документы',
	},
}

// ── Интерактивные состояния (hover / active / focus) ──

export const HoverState: Story = {
	render: () => ({
		components: { BaseFileUpload },
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
				<BaseFileUpload class="base-file-upload--hover" />
			</div>
		`,
	}),
}

export const ActiveState: Story = {
	render: () => ({
		components: { BaseFileUpload },
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Active</span>
				<BaseFileUpload class="base-file-upload--active" />
			</div>
		`,
	}),
}

export const FocusState: Story = {
	render: () => ({
		components: { BaseFileUpload },
		template: `
			<div>
				<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
				<BaseFileUpload class="base-file-upload--focus" />
			</div>
		`,
	}),
}

/** Все интерактивные состояния рядом */
export const InteractiveStates: Story = {
	render: () => ({
		components: { BaseFileUpload },
		template: `
			<div style="display:flex;flex-direction:column;gap:24px;">
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Normal</span>
					<BaseFileUpload />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Hover</span>
					<BaseFileUpload class="base-file-upload--hover" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Active</span>
					<BaseFileUpload class="base-file-upload--active" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Focus</span>
					<BaseFileUpload class="base-file-upload--focus" />
				</div>
				<div>
					<span style="font-size:12px;color:var(--color-text-muted);">Disabled</span>
					<BaseFileUpload is-disabled />
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
		components: { BaseFileUpload },
		template: '<BaseFileUpload label="Загрузите файл" />',
	}),
}

/** Интерактивная */
export const Interactive: Story = {}
