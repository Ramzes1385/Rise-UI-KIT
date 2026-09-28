/**
 * BaseAlert — stories.
 *
 * Разделы: Default (песочница) → внешний вид (типы, варианты, размеры, кастомный цвет) →
 * содержимое (своя иконка, действия, длинный текст) → сценарий «закрытие» → клавиатура.
 */

import { expect, fn } from 'storybook/test'
import { ref } from 'vue'
import {
	ARG_GROUP,
	avatarImage,
	baseArgTypes,
	propGroup,
	SIZE_PRESETS,
	sizeLabel,
	slotArgType,
	tabTo,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import { BaseButton } from '@components/BaseButton'
import { ALERT_TYPES, ALERT_VARIANTS } from '../model/BaseAlert.types'
import BaseAlert from '../ui/BaseAlert.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Реалистичные тексты для каждого типа */
const MESSAGES = {
	info: { title: 'Доступно обновление', description: 'Версия 2.4 ускоряет загрузку таблиц и исправляет импорт отчётов.' },
	success: { title: 'Изменения сохранены', description: 'Участники проекта увидят новый срок в своих задачах.' },
	warning: { title: 'Подписка заканчивается через 3 дня', description: 'Продлите тариф, чтобы не потерять доступ к отчётам.' },
	error: { title: 'Не удалось отправить отчёт', description: 'Сервер не ответил. Проверьте подключение и повторите попытку.' },
} as const

const meta = {
	title: 'Element/BaseAlert',
	component: BaseAlert,
	parameters: {
		docs: {
			description: {
				component: [
					'Оповещение на странице: результат действия, предупреждение, ошибка, подсказка.',
					'',
					'- `type` — роль и иконка: `info`, `success`, `warning`, `error`.',
					'- `variant` — как применяется цвет роли: `default` — заливка, `soft` — мягкий фон, `outline` — рамка,',
					'  `ghost` — только текст, `shadow` — нейтральная карточка с тенью.',
					'- Доступность: `error` и `warning` — `role="alert"` (озвучиваются сразу), `info` и `success` — `role="status"` (вежливо).',
					'- `isClosable` добавляет кнопку «Закрыть» и событие `close`; скрывает алерт родитель. Слот `actions` — кнопки справа.',
					'',
					'Всплывающие уведомления — `BaseNotification`.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes({ variants: ALERT_VARIANTS }),
		type: { control: 'inline-radio', options: ALERT_TYPES, table: propGroup(ARG_GROUP.appearance) },
		title: { control: 'text', table: propGroup(ARG_GROUP.content) },
		description: { control: 'text', table: propGroup(ARG_GROUP.content) },
		icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
		isClosable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: slotArgType('Описание (заменяет description)'),
		actions: { control: false },
	},
	args: {
		type: 'info',
		variant: 'default',
		title: MESSAGES.info.title,
		description: MESSAGES.info.description,
		isClosable: false,
		sizeScale: 100,
		onClose: fn(),
	},
} satisfies Meta<typeof BaseAlert>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: меняйте тип, вариант и тексты в панели Controls. */
export const Default: Story = {
	play: async ({ canvas }) => {
		const alert = canvas.getByRole('status')
		await expect(alert).toHaveTextContent('Доступно обновление')
		await expect(alert).toHaveTextContent('Версия 2.4')
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/** Четыре типа. `error` и `warning` — `role="alert"`, `info` и `success` — `role="status"`. Вариант меняется в Controls. */
export const Types: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isClosable'] },
		docs: { source: { code: ALERT_TYPES.map(type => `<BaseAlert type="${type}" title="${MESSAGES[type].title}" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseAlert },
		setup: () => ({ props: useArgsWithoutSlots(args), types: ALERT_TYPES, messages: MESSAGES }),
		template: `
			<div class="story-stack story-medium">
				<BaseAlert
					v-for="type in types"
					:key="type"
					v-bind="props"
					:type="type"
					:title="messages[type].title"
					:description="messages[type].description" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('status')).toHaveLength(2)
		const [warning, error] = canvas.getAllByRole('alert')
		await expect(warning).toHaveTextContent(MESSAGES.warning.title)
		await expect(error).toHaveTextContent(MESSAGES.error.title)
	},
}

/** Пять вариантов для одного типа (тип меняется в Controls): заливка, мягкий фон, рамка, только текст, карточка с тенью. */
export const Variants: Story = {
	parameters: {
		controls: { include: ['type', 'sizeScale', 'isClosable'] },
		docs: {
			source: {
				code: ['default', 'soft', 'outline', 'ghost', 'shadow']
					.map(variant => `<BaseAlert variant="${variant}" title="${variant}" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: ['default', 'soft', 'outline', 'ghost', 'shadow'] }),
		template: `
			<div class="story-stack story-medium">
				<BaseAlert v-for="variant in variants" :key="variant" v-bind="props" :variant="variant" :title="variant" />
			</div>
		`,
	}),
}

/** Размеры через `sizeScale`: отступы, текст, иконка и кнопка закрытия масштабируются вместе. */
export const Sizes: Story = {
	args: { isClosable: true, description: '' },
	parameters: {
		controls: { include: ['type', 'variant'] },
		docs: {
			source: {
				code: SIZE_PRESETS.map(preset => `<BaseAlert :size-scale="${preset.sizeScale}" title="${preset.name}" is-closable />`).join(
					'\n',
				),
			},
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: () => ({ props: useArgsWithoutSlots(args), presets: SIZE_PRESETS, sizeLabel }),
		template: `
			<div class="story-stack story-medium">
				<BaseAlert v-for="preset in presets" :key="preset.name" v-bind="props" :size-scale="preset.sizeScale" :title="sizeLabel(preset)" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const closeButtons = canvas.getAllByRole('button', { name: 'Закрыть' })
		for (const button of closeButtons) {
			const { width, height } = button.getBoundingClientRect()
			await expect(Math.round(width)).toBe(Math.round(height))
		}
		await expect(closeButtons[2].getBoundingClientRect().height).toBe(24)
	},
}

/**
 * Кастомный цвет через `color`: фон и текст; иконка и кнопка закрытия берут цвет текста.
 * Для обычных сообщений хватает типов — `color` нужен для фирменных блоков.
 */
export const CustomColor: Story = {
	args: {
		title: 'Новый тариф «Команда»',
		description: 'До 20 участников и общий календарь проекта.',
		icon: 'star',
		isClosable: true,
		color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } },
	},
	play: async ({ canvas, canvasElement }) => {
		const alert = canvas.getByRole('status')
		await expect(getComputedStyle(alert).backgroundColor).toBe('rgb(109, 40, 217)')
		const icon = canvasElement.querySelector('.base-alert__icon-wrapper') as HTMLElement
		await expect(getComputedStyle(icon).color).toBe('rgb(255, 255, 255)')
		await expect(getComputedStyle(canvas.getByRole('button', { name: 'Закрыть' })).color).toBe('rgb(255, 255, 255)')
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/** Своя иконка: проп `icon` (имя из спрайта) или слот `icon` — например, аватар автора. */
export const CustomIcon: Story = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseAlert icon="calendar" title="Встреча перенесена на 16:00" />',
					'<BaseAlert title="Иван Петров оставил комментарий">',
					'  <template #icon><img :src="avatar" alt="" class="avatar" /></template>',
					'  «Проверь, пожалуйста, цифры за май»',
					'</BaseAlert>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAlert },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'description', 'icon']), avatar: avatarImage(210) }),
		template: `
			<div class="story-stack story-medium">
				<BaseAlert v-bind="props" icon="calendar" title="Встреча перенесена на 16:00" description="Ссылка на звонок прежняя." />
				<BaseAlert v-bind="props" title="Иван Петров оставил комментарий">
					<template #icon>
						<img :src="avatar" alt="" width="20" height="20" style="border-radius: var(--rise-radius-full);" />
					</template>
					«Проверь, пожалуйста, цифры за май»
				</BaseAlert>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const [first] = canvasElement.querySelectorAll('.base-alert')
		await expect(first.querySelector('use')).toHaveAttribute('href', 'icons.svg#calendar')
	},
}

/** Слот `actions`: кнопки справа от текста. Вместе с `isClosable` кнопка «Закрыть» идёт последней. */
export const WithActions: Story = {
	args: {
		type: 'warning',
		variant: 'soft',
		title: MESSAGES.warning.title,
		description: MESSAGES.warning.description,
		isClosable: true,
	},
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseAlert type="warning" variant="soft" title="…" description="…" is-closable @close="hide">',
					'  <template #actions>',
					'    <BaseButton variant="outline" :size-scale="87.5">Продлить</BaseButton>',
					'  </template>',
					'</BaseAlert>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAlert, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-medium">
				<BaseAlert v-bind="props">
					<template #actions>
						<BaseButton variant="outline" :size-scale="87.5">Продлить</BaseButton>
					</template>
				</BaseAlert>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const [renew, close] = canvas.getAllByRole('button')
		await expect(renew).toHaveAccessibleName('Продлить')
		await expect(close).toHaveAccessibleName('Закрыть')
	},
}

/** Длинный заголовок и описание переносятся по словам; иконка и кнопка закрытия остаются на месте. */
export const LongContent: Story = {
	args: {
		type: 'error',
		variant: 'soft',
		isClosable: true,
		title: 'Не удалось синхронизировать 128 задач проекта «Ребрендинг» с календарём команды',
		description:
			'Календарь вернул ошибку доступа. Попросите администратора рабочего пространства выдать приложению право на запись, затем запустите синхронизацию ещё раз — уже перенесённые задачи не продублируются.',
	},
	render: args => ({
		components: { BaseAlert },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: '<div class="story-narrow"><BaseAlert v-bind="props" /></div>',
	}),
	play: async ({ canvas }) => {
		const alert = canvas.getByRole('alert')
		const close = canvas.getByRole('button', { name: 'Закрыть' })
		await expect(alert.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(close.getBoundingClientRect().right).toBeLessThanOrEqual(alert.getBoundingClientRect().right)
		await expect(alert.scrollWidth).toBeLessThanOrEqual(alert.clientWidth)
	},
}

// ─── Сценарии ──────────────────────────────────────────────────────────────────

/**
 * Закрытие: кнопка «Закрыть» вызывает событие `close`, а скрывает алерт родитель (`v-if`).
 * После закрытия здесь появляется кнопка «Показать снова».
 */
export const Closable: Story = {
	args: {
		type: 'success',
		title: MESSAGES.success.title,
		description: MESSAGES.success.description,
		isClosable: true,
	},
	parameters: {
		docs: {
			source: {
				code: [
					'<BaseAlert v-if="isVisible" type="success" title="Изменения сохранены" is-closable @close="isVisible = false" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseAlert, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), isVisible: ref(true) }),
		template: `
			<div class="story-col story-medium">
				<BaseAlert v-if="isVisible" v-bind="props" style="width: 100%;" @close="isVisible = false" />
				<BaseButton v-else variant="outline" @click="isVisible = true">Показать снова</BaseButton>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Закрыть' }))
		await expect(args.onClose).toHaveBeenCalledOnce()
		await expect(canvas.queryByRole('status')).toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Показать снова' }))
		await expect(canvas.getByRole('status')).toHaveTextContent(MESSAGES.success.title)
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab переводит фокус на «Закрыть», Enter закрывает. На заливке роли кольцо фокуса — цвета текста,
 * чтобы не слиться с фоном.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { isClosable: true },
	play: async ({ canvas, userEvent, args }) => {
		const close = canvas.getByRole('button', { name: 'Закрыть' })
		await tabTo(close, userEvent)
		await expect(getComputedStyle(close).outlineStyle).toBe('solid')
		await expect(getComputedStyle(close).outlineColor).toBe(getComputedStyle(canvas.getByRole('status')).color)
		await userEvent.keyboard('{Enter}')
		await expect(args.onClose).toHaveBeenCalledOnce()
	},
}
