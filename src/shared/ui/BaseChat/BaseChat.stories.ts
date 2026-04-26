/**
 * Stories для компонента BaseChat.
 * Демонстрирует основные варианты чата.
 */

import type { Meta, StoryObj } from '@storybook/vue3'

import type { ChatMessage } from './BaseChat.types'
import BaseChat from './BaseChat.vue'

const MESSAGES: ChatMessage[] = [
	{ id: '1', text: 'Привет! Как дела?', sender: 'other', time: '10:00', senderName: 'Анна' },
	{ id: '2', text: 'Привет! Всё отлично, спасибо!', sender: 'me', time: '10:01', status: 'read' },
	{
		id: '3',
		text: 'Посмотри эту работу',
		sender: 'other',
		time: '10:02',
		senderName: 'Анна',
		imageUrl: 'https://placehold.co/300x200/f97316/ffffff?text=Art',
	},
	{ id: '4', text: 'Вау, красиво!', sender: 'me', time: '10:03', status: 'delivered' },
	{ id: '5', text: 'Рад что понравилось 😊', sender: 'other', time: '10:04', senderName: 'Анна' },
]

const meta: Meta<typeof BaseChat> = {
	title: 'UI/BaseChat',
	component: BaseChat,

	argTypes: {
		variant: {
			control: 'select',
			options: ['bubble', 'modern', 'minimal', 'support', 'sidebar', 'thread', 'feed'],
		},
		styleVariant: {
			control: 'select',
			options: ['default', 'ghost', 'outline', 'shadow', 'soft'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%)',
		},
		messages: { table: { disable: true } },
		onSend: { table: { disable: true } },
		'onScroll-top': { table: { disable: true } },
		'onSend-voice': { table: { disable: true } },
		'onSend-file': { table: { disable: true } },
		'onImage-zoom': { table: { disable: true } },
		'onLink-click': { table: { disable: true } },
		'onQuick-reply': { table: { disable: true } },
		onReaction: { table: { disable: true } },
		onReply: { table: { disable: true } },
	},

	args: {
		variant: 'bubble',
		styleVariant: 'default',
		title: 'Чат с Анной',
		subtitle: 'Онлайн',
		companionAvatar: 'https://placehold.co/48x48/f97316/ffffff?text=A',
		height: '500px',
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseChat>

/** Базовый чат */
export const Default: Story = {
	args: {
		messages: MESSAGES,
	},
}

/** Все варианты стиля */
export const StyleVariants: Story = {
	render: args => ({
		components: { BaseChat },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;flex-direction:column;gap:40px;">
				<div v-for="v in ['default','ghost','outline','shadow','soft']" :key="v">
					<p style="margin-bottom:8px;font-size:12px;color:var(--color-text-muted);">Style Variant: {{ v }}</p>
					<BaseChat v-bind="args" :style-variant="v" :messages="args.messages" height="300px" />
				</div>
			</div>
		`,
	}),
	args: {
		messages: MESSAGES.slice(0, 2),
	},
}

/** Современный стиль */
export const Modern: Story = {
	args: {
		messages: MESSAGES,
		variant: 'modern',
	},
}

/** Минимальный стиль */
export const Minimal: Story = {
	args: {
		messages: MESSAGES,
		variant: 'minimal',
	},
}

/** Чат поддержки */
export const Support: Story = {
	args: {
		messages: MESSAGES,
		variant: 'support',
		isOperatorOnline: true,
		quickReplies: [
			{ label: 'Цены', value: 'prices' },
			{ label: 'Сроки', value: 'deadline' },
			{ label: 'Доставка', value: 'delivery' },
		],
	},
}

/** Пустой чат */
export const Empty: Story = {
	args: {
		messages: [],
	},
}

/** Чат с видео */
export const WithVideo: Story = {
	args: {
		messages: [
			{ id: '1', text: 'Посмотри эту картину!', sender: 'other', time: '10:00', senderName: 'Анна' },
			{
				id: '2',
				sender: 'other',
				time: '10:01',
				senderName: 'Анна',
				imageUrl: 'https://placehold.co/320x180/f97316/ffffff?text=Art',
				text: 'Процесс создания',
			},
			{ id: '3', text: 'Отличная работа!', sender: 'me', time: '10:02', status: 'read' },
		],
	},
}

/** Групповой чат */
export const GroupChat: Story = {
	args: {
		messages: [
			{
				id: '1',
				text: 'Всем привет!',
				sender: 'other',
				time: '10:00',
				senderName: 'Анна',
				senderAvatar: 'https://placehold.co/48x48/f97316/ffffff?text=A',
			},
			{
				id: '2',
				text: 'Привет!',
				sender: 'other',
				time: '10:01',
				senderName: 'Игорь',
				senderAvatar: 'https://placehold.co/48x48/3b82f6/ffffff?text=I',
			},
			{ id: '3', text: 'Добрый день!', sender: 'me', time: '10:02', status: 'read' },
			{
				id: '4',
				text: 'Когда выставка?',
				sender: 'other',
				time: '10:03',
				senderName: 'Анна',
				senderAvatar: 'https://placehold.co/48x48/f97316/ffffff?text=A',
			},
			{ id: '5', text: 'В следующую субботу', sender: 'me', time: '10:04', status: 'delivered' },
		],
		isGroup: true,
		title: 'Группа — Выставка',
		participants: [
			{ id: 1, name: 'Анна', avatar: 'https://placehold.co/48x48/f97316/ffffff?text=A', isOnline: true },
			{ id: 2, name: 'Игорь', avatar: 'https://placehold.co/48x48/3b82f6/ffffff?text=I', isOnline: false },
			{ id: 3, name: 'Вы', isOnline: true },
		],
	},
}

/** Интерактивный */
export const Interactive: Story = {
	args: {
		messages: MESSAGES,
	},
}

/** Масштабирование sizeScale */
export const SizeScale: Story = {
	args: {
		messages: MESSAGES,
	},
	render: args => ({
		components: { BaseChat },
		setup() {
			return { args }
		},
		template: `
			<div style="display: flex; gap: 24px; flex-wrap: wrap; align-items: flex-start;">
				<div v-for="scale in [75, 100, 150]" :key="scale">
					<p style="margin-bottom: 8px; font-size: 13px; color: var(--color-text-muted);">{{ scale }}%</p>
					<BaseChat v-bind="args" :size-scale="scale" height="400px" />
				</div>
			</div>
		`,
	}),
}
