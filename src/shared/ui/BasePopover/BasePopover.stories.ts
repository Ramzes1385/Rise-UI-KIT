/**
 * Stories для компонента BasePopover.
 * Демонстрирует все позиции, варианты и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BasePopover from './BasePopover.vue'

const meta: Meta<typeof BasePopover> = {
	title: 'UI/BasePopover',
	component: BasePopover,

	argTypes: {
		isOpen: { control: 'boolean' },
		position: {
			control: 'inline-radio',
			options: ['top', 'bottom', 'left', 'right'],
		},
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		onClose: { table: { disable: true } },
		'onUpdate:isOpen': { table: { disable: true } },
	},

	args: {
		isOpen: false,
		position: 'bottom',
		variant: 'default',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BasePopover>

/** Базовый popover */
export const Default: Story = {
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger>
						<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
							Открыть popover
						</button>
					</template>
					<div style="padding:12px;">Содержимое popover</div>
				</BasePopover>
			</div>
		`,
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BasePopover },
		setup() {
			const openMap = ref<Record<string, boolean>>({})
			function toggle(v: string) {
				openMap.value[v] = !openMap.value[v]
			}
			return { args, toggle, openMap }
		},
		template: `
			<div style="padding:80px;display:flex;gap:24px;justify-content:center;flex-wrap:wrap;">
				<BasePopover v-for="v in ['default','ghost','outline','shadow','soft']" :key="v"
					v-bind="args"
					:variant="v"
					v-model:is-open="openMap[v]">
					<template #trigger>
						<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="toggle(v)">
							{{ v }}
						</button>
					</template>
					<div style="padding:12px;">Вариант {{ v }}</div>
				</BasePopover>
			</div>
		`,
	}),
}

/** Все позиции */
export const Positions: Story = {
	render: args => ({
		components: { BasePopover },
		setup() {
			const openTop = ref(false)
			const openBottom = ref(false)
			const openLeft = ref(false)
			const openRight = ref(false)
			return { args, openTop, openBottom, openLeft, openRight }
		},
		template: `
			<div style="padding:100px;display:flex;gap:24px;justify-content:center;align-items:center;">
				<BasePopover v-bind="args" position="top" v-model:is-open="openTop">
					<template #trigger>
						<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">top</button>
					</template>
					<div style="padding:12px;">Позиция top</div>
				</BasePopover>

				<BasePopover v-bind="args" position="bottom" v-model:is-open="openBottom">
					<template #trigger>
						<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">bottom</button>
					</template>
					<div style="padding:12px;">Позиция bottom</div>
				</BasePopover>

				<BasePopover v-bind="args" position="left" v-model:is-open="openLeft">
					<template #trigger>
						<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">left</button>
					</template>
					<div style="padding:12px;">Позиция left</div>
				</BasePopover>

				<BasePopover v-bind="args" position="right" v-model:is-open="openRight">
					<template #trigger>
						<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">right</button>
					</template>
					<div style="padding:12px;">Позиция right</div>
				</BasePopover>
			</div>
		`,
	}),
}

/** Popover с контентом */
export const WithContent: Story = {
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger>
						<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
							Информация
						</button>
					</template>
					<div style="padding:16px;min-width:200px;">
						<h4 style="margin:0 0 8px;">Заголовок</h4>
						<p style="margin:0;color:var(--color-text-muted);font-size:14px;">Подробное описание содержимого popover с дополнительной информацией.</p>
					</div>
				</BasePopover>
			</div>
		`,
	}),
}

/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger>
						<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;">
							Переключить
						</button>
					</template>
					<div style="padding:12px;">Контент</div>
				</BasePopover>
			</div>
		`,
	}),
}
