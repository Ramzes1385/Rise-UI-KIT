import '@testing-library/jest-dom/vitest'
import BaseChat from '../ui/BaseChat.vue'
import { createUiKitPlugin } from '@/plugin'
import type { ChatMessage } from '../types/BaseChat.types'
import { render, screen, fireEvent } from '@testing-library/vue'

const MESSAGES: ChatMessage[] = [
	{ id: '1', text: 'Привет', sender: 'other', time: '10:00', isPinned: true },
	{ id: '2', text: 'Здравствуйте', sender: 'me', time: '10:01' },
]

const UI = {
	root: 'u-root',
	body: 'u-body',
	header: 'u-header',
	pinned: 'u-pinned',
	list: 'u-list',
	message: 'u-message',
	bubble: 'u-bubble',
	input: 'u-input',
	toolbar: 'u-toolbar',
}

const part = (container: Element, selector: string) => container.querySelector(selector) as HTMLElement

describe('BaseChat: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseChat, { props: { messages: MESSAGES, title: 'Чат' } })

		expect(part(container, '.base-chat')).toHaveClass('base-chat', 'base-chat--bubble')
		expect(part(container, '.base-chat__body')).toHaveAttribute('class', 'base-chat__body')
		expect(part(container, '.base-chat-header')).toHaveAttribute('class', 'base-chat-header base-chat__header')
		expect(part(container, '.base-chat-pinned-panel')).toHaveAttribute('class', 'base-chat-pinned-panel base-chat__pinned')
		expect(part(container, '.base-chat-message-list')).toHaveAttribute('class', 'base-chat-message-list base-chat__list')
		expect(part(container, '#message-2')).toHaveClass('base-chat-message-list__item', 'base-chat__message')
		expect(part(container, '#message-2 .base-chat-message-list__bubble')).toHaveAttribute(
			'class',
			'base-chat-message-list__bubble base-chat__bubble',
		)
		expect(part(container, '.base-chat-input')).toHaveAttribute('class', 'base-chat-input base-chat__input')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', async () => {
		const { container } = render(BaseChat, {
			props: { messages: MESSAGES, title: 'Чат', variant: 'modern', isTyping: true, customClass: { root: 'own-root' }, ui: UI },
		})

		expect(part(container, '.base-chat')).toHaveClass('base-chat', 'u-root', 'base-chat--modern', 'own-root')
		expect(part(container, '.base-chat__body')).toHaveClass('u-body')
		expect(part(container, '.base-chat-header')).toHaveClass('base-chat__header', 'u-header')
		expect(part(container, '.base-chat-pinned-panel')).toHaveClass('base-chat__pinned', 'u-pinned')
		expect(part(container, '.base-chat-message-list')).toHaveClass('base-chat__list', 'u-list')
		expect(part(container, '#message-1')).toHaveClass('base-chat-message-list__item--other', 'u-message')
		expect(part(container, '#message-1 .base-chat-message-list__bubble')).toHaveClass('u-bubble')
		expect(part(container, '.base-chat-message-list__item--typing-indicator')).toHaveClass('base-chat__message', 'u-message')
		expect(part(container, '.base-chat-message-list__bubble--typing')).toHaveClass('base-chat__bubble', 'u-bubble')
		expect(part(container, '.base-chat-input')).toHaveClass('base-chat__input', 'u-input')

		await fireEvent.click(screen.getAllByRole('button', { name: 'Выбрать сообщение' })[0])

		expect(part(container, '.base-chat-selection-toolbar')).toHaveClass('base-chat__toolbar', 'u-toolbar')
	})

	it('классы из defaults.BaseChat.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseChat, {
			props: { messages: MESSAGES, title: 'Чат', ui: { bubble: 'own-bubble' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseChat: { ui: { root: 'app-root', bubble: 'app-bubble' } } } })] },
		})

		expect(part(container, '.base-chat')).toHaveClass('app-root')
		expect(part(container, '#message-2 .base-chat-message-list__bubble')).toHaveAttribute(
			'class',
			'base-chat-message-list__bubble base-chat__bubble app-bubble own-bubble',
		)
	})
})
