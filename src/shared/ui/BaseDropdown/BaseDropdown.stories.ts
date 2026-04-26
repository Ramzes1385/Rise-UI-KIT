/**
 * Stories для компонента BaseDropdown.
 * Демонстрирует все позиции и настройки.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

import BaseDropdown from './BaseDropdown.vue'

const meta: Meta<typeof BaseDropdown> = {
	title: 'UI/BaseDropdown',
	component: BaseDropdown,

	argTypes: {
		isOpen: { control: 'boolean' },
		variant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		position: {
			control: 'select',
			options: [
				'bottom-start',
				'bottom-end',
				'bottom',
				'top-start',
				'top-end',
				'top',
				'left-start',
				'left-end',
				'left',
				'right-start',
				'right-end',
				'right',
			],
		},
		gap: { control: 'number' },
		maxHeight: { control: 'text' },
		matchWidth: { control: 'boolean' },
		closeOnEscape: { control: 'boolean' },
		preventMousedown: { control: 'boolean' },
		panelClass: { control: 'text' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		onClose: { table: { disable: true } },
	},

	args: {
		isOpen: false,
		position: 'bottom-start',
		variant: 'default',
		gap: 4,
		maxHeight: '320px',
		matchWidth: true,
		closeOnEscape: true,
		preventMousedown: true,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseDropdown>

/** Базовый dropdown */
export const Default: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = !isOpen">
						Открыть
					</button>
					<template #dropdown>
						<div style="padding:8px;">
							<div v-for="i in 5" :key="i" style="padding:8px;cursor:pointer;border-radius:var(--border-radius-base);" @click="isOpen = false">
								Пункт {{ i }}
							</div>
						</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
}

/** Все позиции */
export const Positions: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const positions = [
				'bottom-start',
				'bottom-end',
				'bottom',
				'top-start',
				'top-end',
				'top',
				'left-start',
				'left-end',
				'left',
				'right-start',
				'right-end',
				'right',
			] as const
			const openMap = ref<Record<string, boolean>>({})
			function toggle(p: string) {
				openMap.value[p] = !openMap.value[p]
			}
			return { args, positions, openMap, toggle }
		},
		template: `
			<div style="padding:160px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
				<BaseDropdown v-for="p in positions" :key="p"
					v-bind="args"
					:is-open="!!openMap[p]"
					:position="p"
					@close="openMap[p] = false">
					<button style="padding:6px 12px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;font-size:12px;" @click="toggle(p)">
						{{ p }}
					</button>
					<template #dropdown>
						<div style="padding:8px;">Контент {{ p }}</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
}

/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const openMap = ref<Record<string, boolean>>({})
			function toggle(v: string) {
				openMap.value[v] = !openMap.value[v]
			}
			return { args, toggle, openMap }
		},
		template: `
			<div style="padding:80px;display:flex;gap:12px;justify-content:center;">
				<BaseDropdown v-for="v in ['default','ghost','outline','shadow','soft']" :key="v"
					v-bind="args"
					:is-open="!!openMap[v]"
					:variant="v"
					@close="openMap[v] = false">
					<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="toggle(v)">
						{{ v }}
					</button>
					<template #dropdown>
						<div style="padding:8px;">Контент {{ v }}</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
}

/** Интерактивный */
export const Interactive: Story = {
	render: args => ({
		components: { BaseDropdown },
		setup() {
			const isOpen = ref(false)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BaseDropdown v-bind="args" v-model:is-open="isOpen">
					<button style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:pointer;" @click="isOpen = !isOpen">
						Открыть
					</button>
					<template #dropdown>
						<div style="padding:8px;">Контент</div>
					</template>
				</BaseDropdown>
			</div>
		`,
	}),
}
