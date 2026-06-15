/**
 * Stories для компонента BasePopover.
 * Демонстрирует все позиции, варианты и интерактивные состояния.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, fn, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'

import { buildArgTypes } from '@utils/storybookUtils'
import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'

import { POPOVER_VARIANTS } from '../model/BasePopover.types'
import BasePopover from '../ui/BasePopover.vue'

const meta: Meta<typeof BasePopover> = {
	title: 'UI/BasePopover',
	component: BasePopover,

	argTypes: buildArgTypes({
		props: {
			isOpen: { control: 'boolean' },
			position: {
				control: 'inline-radio',
				options: ['top', 'bottom', 'left', 'right'],
			},
			variant: { control: 'radio', options: POPOVER_VARIANTS },
			color: {
				control: 'object',
				description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
			},
			sizeScale: {
				control: { type: 'range', min: 50, max: 200, step: 10 },
				description: 'Масштаб размера (50–200%, по умолчанию 100)',
			},
		},
		hidden: ['onClose', 'onUpdate:isOpen'],
	}),

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
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка триггера по Tab', async () => {
			await userEvent.tab()
			const trigger = canvasElement.querySelector('button')
			expect(trigger).toHaveFocus()
		})

		await step('Обратная фокусировка по Shift+Tab', async () => {
			await playShiftTab(canvasElement, { selector: 'button' })
		})

		await step('Открытие popover по Enter', async () => {
			await userEvent.keyboard('{Enter}')
			await waitFor(() => {
				expect(document.querySelector('.base-popover__panel')).toBeInTheDocument()
			})
		})

		await step('Закрытие popover по Escape', async () => {
			await userEvent.keyboard('{Escape}')
			await waitFor(() => {
				expect(document.querySelector('.base-popover__panel')).not.toBeInTheDocument()
			})
		})
	},
}
/** Отключённый popover */
export const Disabled: Story = {
	render: () => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(false)
			return { isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-model:is-open="isOpen">
					<template #trigger>
						<button disabled style="padding:8px 16px;border:1px solid var(--color-border);border-radius:var(--border-radius-base);cursor:not-allowed;opacity:0.5;">
							Отключён
						</button>
					</template>
					<div style="padding:12px;">Контент</div>
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
			const variants = [...POPOVER_VARIANTS]
			const openMap = ref<Record<string, boolean>>({})
			function toggle(v: string) {
				openMap.value[v] = !openMap.value[v]
			}
			return { args, toggle, openMap, variants }
		},
		template: `
			<div style="padding:80px;display:flex;gap:24px;justify-content:center;flex-wrap:wrap;">
				<BasePopover v-for="v in variants" :key="v"
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
/** Кастомный цвет */
export const CustomColor: Story = {
	args: {
		isOpen: true,
		color: { bg: { base: '#fef3c7' }, text: { base: '#92400e' } },
	},
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Триггер</button></template>
					<div style="padding:12px;">Кастомный цвет</div>
				</BasePopover>
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
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Триггер</button></template>
					<div style="padding:12px;">Тёмный popover</div>
				</BasePopover>
			</div>
		`,
	}),
}
/** Внешнее изменение isOpen — покрывает watch синхронизацию */
export const ExternalOpenChange: Story = {
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Открыт</button></template>
					<div style="padding:12px;">Контент</div>
				</BasePopover>
			</div>
		`,
	}),
	args: { isOpen: true },
}
/** Внешнее изменение isOpen с false на true — покрывает watch callback */
export const ExternalOpenFromFalse: Story = {
	args: {
		isOpen: false,
		onClose: fn(),
		'onUpdate:isOpen': fn(),
	},
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(false)
			// Меняем на true через 50ms — триггерит watch
			setTimeout(() => {
				isOpen.value = true
			}, 50)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Триггер</button></template>
					<div style="padding:12px;">Контент</div>
				</BasePopover>
			</div>
		`,
	}),
}
/** Закрытие через BaseDropdown — покрывает handleClose и emit close */
export const CloseViaDropdown: Story = {
	args: {
		isOpen: true,
		onClose: fn(),
		'onUpdate:isOpen': fn(),
	},
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Триггер</button></template>
					<div style="padding:12px;">Контент</div>
				</BasePopover>
			</div>
		`,
	}),
	play: async ({ canvasElement, args }) => {
		// Закрытие через Escape — BaseDropdown слушает Escape
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
		await new Promise(r => setTimeout(r, 100))
		expect(args.onClose).toHaveBeenCalled()
	},
}
/** Масштаб размера */
export const SizeScale: Story = {
	args: {
		isOpen: true,
		sizeScale: 150,
	},
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Триггер</button></template>
					<div style="padding:12px;">150%</div>
				</BasePopover>
			</div>
		`,
	}),
}
/** Закрытие через handleClose — покрывает emit update:isOpen(false) и emit close */
export const HandleClose: Story = {
	args: {
		isOpen: true,
		onClose: fn(),
		'onUpdate:isOpen': fn(),
	},
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Триггер</button></template>
					<div style="padding:12px;">Контент</div>
				</BasePopover>
			</div>
		`,
	}),
	play: async ({ args, canvasElement }) => {
		// Клик снаружи popover — через mousedown на document (useClickOutside)
		await new Promise(r => setTimeout(r, 100))
		document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
		await new Promise(r => setTimeout(r, 100))
		expect(args.onClose).toHaveBeenCalled()
		expect(args['onUpdate:isOpen']).toHaveBeenCalledWith(false)
	},
}
/** Позиция top + вариант ghost — покрывает panelClasses с нестандартным variant */
export const TopGhost: Story = {
	args: {
		isOpen: true,
		position: 'top' as const,
		variant: 'ghost' as const,
	},
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Триггер</button></template>
					<div style="padding:12px;">Top + Ghost</div>
				</BasePopover>
			</div>
		`,
	}),
}
/** Позиция left — покрывает все 4 позиции */
export const LeftPosition: Story = {
	args: {
		isOpen: true,
		position: 'left' as const,
	},
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Триггер</button></template>
					<div style="padding:12px;">Left</div>
				</BasePopover>
			</div>
		`,
	}),
}
/** Вариант shadow — покрывает panelClasses */
export const ShadowVariant: Story = {
	args: {
		isOpen: true,
		variant: 'shadow' as const,
	},
	render: args => ({
		components: { BasePopover },
		setup() {
			const isOpen = ref(true)
			return { args, isOpen }
		},
		template: `
			<div style="padding:80px;display:flex;justify-content:center;">
				<BasePopover v-bind="args" v-model:is-open="isOpen">
					<template #trigger><button>Триггер</button></template>
					<div style="padding:12px;">Shadow</div>
				</BasePopover>
			</div>
		`,
	}),
}
/** Popover с длинным содержимым */
export const LongContent: Story = {
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
							Подробная информация
						</button>
					</template>
					<div style="padding:16px;max-width:320px;">
						<h4 style="margin:0 0 8px;">Подробное описание услуги</h4>
						<p style="margin:0 0 8px;color:var(--color-text-muted);font-size:14px;">
							Художественная ковка — это древнейший ремесленный процесс обработки металла, который позволяет создавать уникальные декоративные элементы для интерьера и экстерьера.
						</p>
						<p style="margin:0;color:var(--color-text-muted);font-size:14px;">
							Наши мастера используют традиционные техники ручной ковки, сочетая их с современными методами обработки металла для достижения наилучшего результата.
						</p>
					</div>
				</BasePopover>
			</div>
		`,
	}),
}
