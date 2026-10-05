import '@testing-library/jest-dom/vitest'
import BaseChat from '../ui/BaseChat.vue'
import { render, waitFor } from '@testing-library/vue'
import { ChatMessageList } from '../ui/ChatMessageList'
import type { ChatMessage } from '../types/BaseChat.types'

const message = (id: string, sender: ChatMessage['sender'] = 'me'): ChatMessage => ({ id, text: `Сообщение ${id}`, sender, time: '10:00' })

const HISTORY = [message('1', 'other'), message('2')]
const REAL_TRANSITIONS = { global: { stubs: { 'transition-group': false } } }

function setup(messages: ChatMessage[] = HISTORY) {
	const view = render(BaseChat, { props: { messages, title: 'Чат' }, ...REAL_TRANSITIONS })
	const item = (id: string) => view.container.querySelector(`#message-${id}`) as HTMLElement
	return { ...view, item, list: view.container.querySelector('.base-chat-message-list') as HTMLElement }
}

describe('BaseChat: появление сообщений', () => {
	it('первый показ — без анимации появления', () => {
		const { item } = setup()

		expect(item('1')).not.toHaveClass('base-chat-message-enter-active')
		expect(item('2')).not.toHaveClass('base-chat-message-enter-active')
	})

	it('новое сообщение в конце въезжает (enter-slide), остальные — без классов перехода', async () => {
		const { rerender, item } = setup()

		await rerender({ messages: [...HISTORY, message('3')] })

		expect(item('3')).toHaveClass('base-chat-message-enter-from', 'base-chat-message-enter-active')
		expect(item('2')).not.toHaveClass('base-chat-message-enter-active')
		await waitFor(() => expect(item('3')).not.toHaveClass('base-chat-message-enter-active'))
	})

	it('подгрузка истории в начало — без анимации', async () => {
		const { rerender, item } = setup()

		await rerender({ messages: [message('0', 'other'), ...HISTORY] })

		expect(item('0')).not.toHaveClass('base-chat-message-enter-active')
		expect(item('0')).toHaveClass('base-chat-message-static-enter-active')
	})

	it('первые сообщения в пустой ленте — без анимации', async () => {
		const { rerender, item } = setup([])

		await rerender({ messages: HISTORY })

		expect(item('1')).not.toHaveClass('base-chat-message-enter-active')
	})

	it('удалённое сообщение уходит поверх ленты: координаты закреплены, соседи сдвигаются transform', async () => {
		const { rerender, item } = setup([...HISTORY, message('3')])
		const leaving = item('2')

		await rerender({ messages: [HISTORY[0], message('3')] })

		expect(leaving).toHaveClass('base-chat-message-leave-active')
		expect(leaving.style.top).toBe('0px')
		expect(leaving.style.width).toBe('0px')
		await waitFor(() => expect(item('2')).toBeNull())
	})

	it('смена поиска — без анимации и без закрепления уходящих', async () => {
		const { container, rerender } = render(ChatMessageList, { props: { messages: HISTORY }, ...REAL_TRANSITIONS })
		const item = (id: string) => container.querySelector(`#message-${id}`) as HTMLElement
		const leaving = item('1')

		await rerender({ messages: [HISTORY[1]], searchQuery: '2' })
		expect(leaving.style.top).toBe('')

		await rerender({ messages: HISTORY, searchQuery: '' })
		expect(item('1')).toHaveClass('base-chat-message-static-enter-active')
	})
})

describe('BaseChat: автопрокрутка ленты', () => {
	const scrollTo = vi.fn()

	beforeEach(() => {
		scrollTo.mockClear()
		Object.defineProperty(HTMLElement.prototype, 'scrollTo', { value: scrollTo, configurable: true, writable: true })
	})

	afterEach(() => {
		Reflect.deleteProperty(HTMLElement.prototype, 'scrollTo')
		Reflect.deleteProperty(window, 'matchMedia')
		document.documentElement.removeAttribute('data-rise-motion')
	})

	it('первый показ — сразу к низу, без плавной прокрутки', async () => {
		const { list } = setup()

		await waitFor(() => expect(list.scrollTop).toBe(list.scrollHeight))
		expect(scrollTo).not.toHaveBeenCalled()
	})

	it('новое сообщение — плавная прокрутка к низу', async () => {
		const { rerender } = setup()

		await rerender({ messages: [...HISTORY, message('3')] })

		await waitFor(() => expect(scrollTo).toHaveBeenCalledWith({ top: expect.any(Number), behavior: 'smooth' }))
	})

	it('подгрузка истории — сразу, без плавной прокрутки', async () => {
		const { rerender } = setup()

		await rerender({ messages: [message('0', 'other'), ...HISTORY] })
		await new Promise(resolve => setTimeout(resolve))

		expect(scrollTo).not.toHaveBeenCalled()
	})

	it('пресет none — новое сообщение без плавной прокрутки', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { rerender } = setup()

		await rerender({ messages: [...HISTORY, message('3')] })
		await new Promise(resolve => setTimeout(resolve))

		expect(scrollTo).not.toHaveBeenCalled()
	})

	it('системное «уменьшить движение» — без плавной прокрутки', async () => {
		Object.defineProperty(window, 'matchMedia', {
			configurable: true,
			value: () => ({ matches: true, addEventListener: () => undefined, removeEventListener: () => undefined }),
		})
		const { rerender } = setup()

		await rerender({ messages: [...HISTORY, message('3')] })
		await new Promise(resolve => setTimeout(resolve))

		expect(scrollTo).not.toHaveBeenCalled()
	})
})
