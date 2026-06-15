/**
 * Stories для компонента BaseNotification.
 * Демонстрирует все типы, варианты и масштабирование уведомлений.
 */

import type { Meta, StoryObj } from '@storybook/vue3'
import { expect, userEvent, waitFor } from 'storybook/test'
import { ref } from 'vue'

import { playShiftTab } from '@utils/storybookUtils/a11yHelpers'

import { NOTIFICATION_POSITIONS, NOTIFICATION_TYPES, NOTIFICATION_VARIANTS } from '../model/BaseNotification.types'
import BaseNotification from '../ui/BaseNotification.vue'

const meta: Meta<typeof BaseNotification> = {
	title: 'UI/BaseNotification',
	component: BaseNotification,

	argTypes: {
		title: { control: 'text' },
		description: { control: 'text' },
		type: {
			control: 'inline-radio',
			options: [...NOTIFICATION_TYPES],
		},
		variant: {
			control: 'radio',
			options: [...NOTIFICATION_VARIANTS],
		},
		position: {
			control: 'select',
			options: [...NOTIFICATION_POSITIONS],
			description: 'Позиция контейнера на экране',
		},
		duration: { control: 'number' },
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		color: {
			control: 'object',
			description: 'Объект CustomColor',
		},
		isContained: { table: { disable: true } },
		notificationKey: { table: { disable: true } },
		onClose: { table: { disable: true } },
	},

	args: {
		title: 'Уведомление',
		description: 'Описание уведомления',
		type: 'info',
		variant: 'default',
		duration: 0,
		sizeScale: 100,
		isContained: true,
	},
}

export default meta
type Story = StoryObj<typeof BaseNotification>
/** Базовое уведомление */
export const Default: Story = {
	play: async ({ canvasElement, step }) => {
		await step('Фокусировка уведомления по Tab', async () => {
			await userEvent.tab()
		})
		await playShiftTab(canvasElement, { selector: '.base-notification' })
	},
}
/** Все типы */
export const Types: Story = {
	render: args => ({
		components: { BaseNotification },
		setup() {
			return { args, types: NOTIFICATION_TYPES }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;max-width:400px;">
				<BaseNotification v-for="t in types"
					:key="t"
					v-bind="args"
					:type="t"
					:title="t"
				/>
			</div>
		`,
	}),
}
/** Все варианты */
export const Variants: Story = {
	render: args => ({
		components: { BaseNotification },
		setup() {
			return { args, variants: NOTIFICATION_VARIANTS }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:12px;max-width:400px;">
				<BaseNotification v-for="v in variants"
					:key="v"
					v-bind="args"
					:variant="v"
					:title="v"
				/>
			</div>
		`,
	}),
}
/** Масштабирование */
export const SizeScale: Story = {
	render: args => ({
		components: { BaseNotification },
		setup() {
			return { args, scales: [75, 100, 150] }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:16px;max-width:500px;">
				<BaseNotification v-for="s in scales" :key="s"
					v-bind="args"
					:size-scale="s"
					:title="s + '%'"
				/>
			</div>
		`,
	}),
}
/** Только заголовок */
export const TitleOnly: Story = {
	args: {
		title: 'Сохранено',
		description: '',
		type: 'success',
		duration: 0,
	},
}
/** С описанием */
export const WithDescription: Story = {
	args: {
		title: 'Ошибка',
		description: 'Не удалось сохранить изменения. Попробуйте позже.',
		type: 'error',
		duration: 0,
	},
}
/** Интерактивное управление с кнопками вызова */
export const Interactive: Story = {
	args: {
		duration: 3000,
	},
	render: args => ({
		components: { BaseNotification },
		setup() {
			const refNotification = ref<InstanceType<typeof BaseNotification> | null>(null)
			let keyCounter = 0

			function handleAdd(type: string) {
				keyCounter++
				refNotification.value?.add({
					title: args.title || type,
					description: args.description,
					type: type as (typeof NOTIFICATION_TYPES)[number],
					variant: args.variant,
					duration: args.duration,
					sizeScale: args.sizeScale,
					color: args.color,
					notificationKey: keyCounter,
				})
			}

			return { args, refNotification, handleAdd, types: NOTIFICATION_TYPES }
		},
		template: `
			<div>
				<div style="display:flex;gap:8px;margin-bottom:16px;">
					<button v-for="t in types" :key="t"
						@click="handleAdd(t)"
						style="padding:8px 16px;border:1px solid #ccc;border-radius:6px;cursor:pointer;background:#f5f5f5;">
						{{ t }}
					</button>
				</div>
				<BaseNotification
					ref="refNotification"
					v-bind="args"
				/>
			</div>
		`,
	}),
}
/** Уведомление с длинным текстом сообщения */
export const LongContent: Story = {
	args: {
		title: 'Внимание',
		description:
			'Это очень длинное описание уведомления, которое должно корректно переноситься на новые строки и не выходить за границы контейнера. Текст содержит более двухсот символов для проверки того, как компонент справляется с переполнением контента и обеспечивает читаемость даже при значительном объёме информации.',
		type: 'warning',
		duration: 0,
	},
}
/** Закрытие уведомления по клику на кнопку закрытия */
export const CloseByButton: Story = {
	render: () => ({
		components: { BaseNotification },
		setup() {
			const refNotification = ref<InstanceType<typeof BaseNotification> | null>(null)
			function handleAdd(): void {
				refNotification.value?.add({
					title: 'Закрой меня',
					description: 'Жмём крестик',
					type: 'info',
					duration: 60000,
				})
			}
			return { refNotification, handleAdd }
		},
		template: `
			<div>
				<button class="add-notification-btn" type="button" @click="handleAdd" style="padding:8px 16px;">
					Показать уведомление
				</button>
				<BaseNotification ref="refNotification" :is-contained="true" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const addBtn = canvasElement.querySelector('.add-notification-btn') as HTMLButtonElement
		await userEvent.click(addBtn)
		await waitFor(() => {
			const notification = canvasElement.querySelector('.base-notification')
			expect(notification).toBeTruthy()
		})
		const closeBtn = canvasElement.querySelector('.base-notification__close') as HTMLButtonElement
		expect(closeBtn).toBeTruthy()
		await userEvent.click(closeBtn)
		await waitFor(() => {
			const notification = canvasElement.querySelector('.base-notification')
			expect(notification).toBeFalsy()
		})
	},
}
/** Автозакрытие по таймауту — покрывает setTimeout → remove → emit('close') */
export const AutoCloseAfterDuration: Story = {
	render: () => ({
		components: { BaseNotification },
		setup() {
			const refNotification = ref<InstanceType<typeof BaseNotification> | null>(null)
			function handleAdd(): void {
				refNotification.value?.add({
					title: 'Авто-закрытие',
					description: 'Закроется через 50мс',
					type: 'success',
					duration: 50,
				})
			}
			return { refNotification, handleAdd }
		},
		template: `
			<div>
				<button class="add-auto-btn" type="button" @click="handleAdd" style="padding:8px 16px;">
					Показать
				</button>
				<BaseNotification ref="refNotification" :is-contained="true" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const addBtn = canvasElement.querySelector('.add-auto-btn') as HTMLButtonElement
		await userEvent.click(addBtn)
		await waitFor(() => {
			expect(canvasElement.querySelector('.base-notification')).toBeTruthy()
		})
		await waitFor(
			() => {
				expect(canvasElement.querySelector('.base-notification')).toBeFalsy()
			},
			{ timeout: 2000 },
		)
	},
}
/** Добавление без явного type и duration — покрывает дефолтные ветки `|| 'info'` и `|| 3000` */
export const AddWithoutTypeAndDuration: Story = {
	render: () => ({
		components: { BaseNotification },
		setup() {
			const refNotification = ref<InstanceType<typeof BaseNotification> | null>(null)
			function handleAdd(): void {
				refNotification.value?.add({ title: 'Без типа' })
			}
			return { refNotification, handleAdd }
		},
		template: `
			<div>
				<button class="add-no-type-btn" type="button" @click="handleAdd" style="padding:8px 16px;">
					Показать
				</button>
				<BaseNotification ref="refNotification" :is-contained="true" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const addBtn = canvasElement.querySelector('.add-no-type-btn') as HTMLButtonElement
		await userEvent.click(addBtn)
		await waitFor(() => {
			const notification = canvasElement.querySelector('.base-notification--info')
			expect(notification).toBeTruthy()
		})
	},
}
/** Закрытие одного из нескольких уведомлений — покрывает false-ветку if (notifications.value.length === 0) в remove (стр. 109). */
export const CloseOneOfMany: Story = {
    args: {
        position: "bottom-center"
    },

    render: () => ({
		components: { BaseNotification },
		setup() {
			const refNotification = ref<InstanceType<typeof BaseNotification> | null>(null)
			function handleAddMany(): void {
				refNotification.value?.add({ title: 'Первое', type: 'info', duration: 60000 })
				refNotification.value?.add({ title: 'Второе', type: 'info', duration: 60000 })
			}
			return { refNotification, handleAddMany }
		},
		template: `
			<div>
				<button class="add-many-btn" type="button" @click="handleAddMany" style="padding:8px 16px;">
					Показать два
				</button>
				<BaseNotification ref="refNotification" :is-contained="true" />
			</div>
		`,
	}),

    play: async ({ canvasElement }) => {
		const addBtn = canvasElement.querySelector('.add-many-btn') as HTMLButtonElement
		await userEvent.click(addBtn)
		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-notification').length).toBe(2)
		})
		const firstClose = canvasElement.querySelector('.base-notification__close') as HTMLButtonElement
		await userEvent.click(firstClose)
		await waitFor(() => {
			expect(canvasElement.querySelectorAll('.base-notification').length).toBe(1)
		})
	}
}
/** Позиционирование на экране (fixed-режим). Кнопки переключают позицию контейнера. */
export const Positions: Story = {
	render: () => ({
		components: { BaseNotification },
		setup() {
			const refNotification = ref<InstanceType<typeof BaseNotification> | null>(null)
			const position = ref<(typeof NOTIFICATION_POSITIONS)[number]>('top-right')

			function show(pos: (typeof NOTIFICATION_POSITIONS)[number]): void {
				position.value = pos
				refNotification.value?.add({
					title: pos,
					description: 'Позиция контейнера',
					type: 'info',
					duration: 60000,
				})
			}

			return { refNotification, position, positions: NOTIFICATION_POSITIONS, show }
		},
		template: `
			<div>
				<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">
					<button v-for="p in positions" :key="p"
						class="position-btn"
						type="button"
						@click="show(p)"
						style="padding:8px 12px;border:1px solid #ccc;border-radius:6px;cursor:pointer;background:#f5f5f5;">
						{{ p }}
					</button>
				</div>
				<BaseNotification ref="refNotification" :position="position" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const btn = canvasElement.querySelector('.position-btn') as HTMLButtonElement
		await userEvent.click(btn)
		await waitFor(() => {
			const container = document.querySelector('.base-notification-container--top-left')
			expect(container).toBeTruthy()
		})
	},
}
