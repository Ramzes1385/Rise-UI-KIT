/**
 * Unit-тесты для useChatState.
 * Композабл управляет поиском, выделением, закрепами и панелью информации чата.
 */

import '@testing-library/jest-dom/vitest'
import { effectScope, nextTick } from 'vue'

import type { ChatMessage } from '../BaseChat.types'
import { useChatState } from './useChatState'

type Emit = Parameters<typeof useChatState>[1]

function message(id: string, overrides: Partial<ChatMessage> = {}): ChatMessage {
	return {
		id,
		text: `Сообщение ${id}`,
		sender: 'other',
		time: '10:00',
		...overrides,
	}
}

function setup(
	messages: ChatMessage[],
	options?: Parameters<typeof useChatState>[2],
): { state: ReturnType<typeof useChatState>; emit: ReturnType<typeof vi.fn> & Emit } {
	const emit = vi.fn() as unknown as ReturnType<typeof vi.fn> & Emit
	const scope = effectScope()
	const state = scope.run(() => useChatState({ messages }, emit, options)) as ReturnType<typeof useChatState>
	return { state, emit }
}

describe('useChatState unit', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		vi.restoreAllMocks()
		vi.useRealTimers()
	})

	describe('закрепленные сообщения', () => {
		it('возвращает null, когда закрепов нет', () => {
			const { state } = setup([message('1'), message('2')])
			expect(state.currentPinnedMessage.value).toBeNull()
			expect(state.pinnedMessages.value).toHaveLength(0)
		})

		it('возвращает текущий закреп по индексу', () => {
			const { state } = setup([message('1', { isPinned: true }), message('2', { isPinned: true })])
			expect(state.pinnedMessages.value).toHaveLength(2)
			expect(state.currentPinnedMessage.value?.id).toBe('1')
		})

		it('возвращает null, когда индекс указывает мимо массива закрепов', () => {
			const { state } = setup([message('1', { isPinned: true })])
			state.currentPinnedIndex.value = -1
			expect(state.currentPinnedMessage.value).toBeNull()
		})

		it('корректирует индекс, если он вышел за границы', async () => {
			const { state } = setup([message('1', { isPinned: true }), message('2', { isPinned: true })])
			state.currentPinnedIndex.value = 5
			await nextTick()
			expect(state.currentPinnedMessage.value?.id).toBe('2')
			expect(state.currentPinnedIndex.value).toBe(1)
		})

		it('перелистывает закрепы вперёд по кругу', () => {
			const { state } = setup([message('1', { isPinned: true }), message('2', { isPinned: true })])
			state.handleNextPinned()
			expect(state.currentPinnedIndex.value).toBe(1)
			state.handleNextPinned()
			expect(state.currentPinnedIndex.value).toBe(0)
		})

		it('перелистывает закрепы назад по кругу', () => {
			const { state } = setup([message('1', { isPinned: true }), message('2', { isPinned: true })])
			state.handlePrevPinned()
			expect(state.currentPinnedIndex.value).toBe(1)
		})

		it('не перелистывает, когда закреп один', () => {
			const { state } = setup([message('1', { isPinned: true })])
			state.handleNextPinned()
			state.handlePrevPinned()
			expect(state.currentPinnedIndex.value).toBe(0)
		})
	})

	describe('поиск и фильтрация', () => {
		it('возвращает все сообщения при пустом запросе', () => {
			const { state } = setup([message('1'), message('2')])
			expect(state.filteredMessages.value).toHaveLength(2)
		})

		it('фильтрует сообщения по подстроке без учёта регистра', () => {
			const { state } = setup([message('1', { text: 'Привет МИР' }), message('2', { text: 'Другое' })])
			state.searchQuery.value = 'мир'
			expect(state.filteredMessages.value).toHaveLength(1)
			expect(state.filteredMessages.value[0]?.id).toBe('1')
		})
	})

	describe('галерея изображений', () => {
		it('собирает url всех изображений из вложений', () => {
			const { state } = setup([
				message('1', {
					attachments: [
						{ id: 'a', name: 'a.png', type: 'image', url: 'u1' },
						{ id: 'b', name: 'b.pdf', type: 'file', url: 'u2' },
					],
				}),
				message('2'),
			])
			expect(state.allImagesUrls.value).toEqual(['u1'])
		})
	})

	describe('выделение сообщений', () => {
		it('добавляет сообщение в выделение и эмитит событие', () => {
			const { state, emit } = setup([message('1')])
			state.handleMessageSelect('1')
			expect(state.selectedMessageIds.value).toContain('1')
			expect(emit).toHaveBeenCalledWith('message-select', '1')
		})

		it('снимает выделение при повторном выборе', () => {
			const { state } = setup([message('1')])
			state.handleMessageSelect('1')
			state.handleMessageSelect('1')
			expect(state.selectedMessageIds.value).not.toContain('1')
		})
	})

	describe('ответ на сообщение', () => {
		it('сохраняет сообщение, на которое отвечают', () => {
			const selectedMessage = message('1')
			const { state } = setup([selectedMessage])

			state.handleMessageReply(selectedMessage)

			expect(state.replyingTo.value).toStrictEqual(selectedMessage)
		})

		it('сбрасывает сообщение, на которое отвечают', () => {
			const { state } = setup([message('1')])
			state.handleMessageReply(message('1'))

			state.handleCancelReply()

			expect(state.replyingTo.value).toBeNull()
		})
	})

	describe('панель информации', () => {
		it('открывает профиль участника по клику на аватар', () => {
			const { state, emit } = setup([message('1')])
			state.handleAvatarClick('user-1')
			expect(state.selectedMemberId.value).toBe('user-1')
			expect(state.activeTab.value).toBe('profile')
			expect(state.isInfoOpen.value).toBe(true)
			expect(emit).toHaveBeenCalledWith('avatar-click', 'user-1')
		})

		it('открывает вкладку info при первом клике на инфо', () => {
			const { state, emit } = setup([message('1')])
			state.handleInfoClick()
			expect(state.isInfoOpen.value).toBe(true)
			expect(state.activeTab.value).toBe('info')
			expect(state.selectedMemberId.value).toBeNull()
			expect(emit).toHaveBeenCalledWith('info-click')
		})

		it('закрывает панель при повторном клике на инфо', () => {
			const { state } = setup([message('1')])
			state.handleInfoClick()
			state.handleInfoClick()
			expect(state.isInfoOpen.value).toBe(false)
		})
	})

	describe('скролл к закрепу', () => {
		it('делегирует скролл к сообщению во внешний callback', () => {
			const scrollToMessage = vi.fn()
			const { state } = setup([message('1')], { scrollToMessage })
			state.handleScrollToPinned('1')

			expect(scrollToMessage).toHaveBeenCalledWith('1')
		})

		it('не падает без внешнего callback скролла', () => {
			const { state } = setup([message('1')])
			expect(() => state.handleScrollToPinned('1')).not.toThrow()
		})
	})
})
