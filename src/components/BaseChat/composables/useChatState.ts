import { computed, ref } from 'vue'
import type { ChatMember, ChatMessage } from '../BaseChat.types'

export function useChatState(
	props: {
		messages: ChatMessage[]
		isGroup?: boolean
		members?: ChatMember[]
		currentUserRole?: 'admin' | 'member'
	},
	emit: {
		(event: 'message-select', messageId: string): void
		(event: 'avatar-click', senderId: string): void
		(event: 'info-click'): void
		(event: 'pin-message', messageId: string): void
		(event: 'unpin-message', messageId: string): void
	},
) {
	const searchQuery = ref('')
	const isSearching = ref(false)
	const selectedMessageIds = ref<string[]>([])
	const replyingTo = ref<ChatMessage | null>(null)
	const isInfoOpen = ref(false)
	const activeTab = ref<'info' | 'media' | 'files' | 'links' | 'profile'>('info')
	const selectedMemberId = ref<string | null>(null)

	// Управление закрепленными сообщениями (несколько закрепов)
	const currentPinnedIndex = ref(0)
	const pinnedMessages = computed((): ChatMessage[] => {
		return props.messages.filter(msg => msg.isPinned)
	})
	const currentPinnedMessage = computed((): ChatMessage | null => {
		if (pinnedMessages.value.length === 0) return null
		// Корректируем индекс если он вышел за границы
		if (currentPinnedIndex.value >= pinnedMessages.value.length) {
			currentPinnedIndex.value = Math.max(0, pinnedMessages.value.length - 1)
		}
		return pinnedMessages.value[currentPinnedIndex.value] || null
	})

	// Фильтрация сообщений по поисковому запросу
	const filteredMessages = computed((): ChatMessage[] => {
		if (!searchQuery.value) return props.messages
		const query = searchQuery.value.toLowerCase()
		return props.messages.filter(msg => msg.text?.toLowerCase().includes(query))
	})

	// Глобальный массив картинок для Telegram-like скролла галереи
	const allImagesUrls = computed((): string[] => {
		const urls: string[] = []
		for (const msg of props.messages) {
			if (msg.attachments) {
				for (const att of msg.attachments) {
					if (att.type === 'image') {
						urls.push(att.url)
					}
				}
			}
		}
		return urls
	})

	/** Обработка выделения сообщения */
	function handleMessageSelect(messageId: string): void {
		const index = selectedMessageIds.value.indexOf(messageId)
		if (index === -1) {
			selectedMessageIds.value.push(messageId)
		} else {
			selectedMessageIds.value.splice(index, 1)
		}
		emit('message-select', messageId)
	}

	/** Обработка клика по аватару/имени автора */
	function handleAvatarClick(senderId: string): void {
		selectedMemberId.value = senderId
		activeTab.value = 'profile'
		isInfoOpen.value = true
		emit('avatar-click', senderId)
	}

	/** Обработка клика по кнопке информации */
	function handleInfoClick(): void {
		isInfoOpen.value = !isInfoOpen.value
		if (isInfoOpen.value) {
			activeTab.value = 'info'
			selectedMemberId.value = null
		}
		emit('info-click')
	}

	/** Перелистывание закрепов */
	function handleNextPinned(): void {
		if (pinnedMessages.value.length <= 1) return
		currentPinnedIndex.value = (currentPinnedIndex.value + 1) % pinnedMessages.value.length
	}

	function handlePrevPinned(): void {
		if (pinnedMessages.value.length <= 1) return
		currentPinnedIndex.value =
			(currentPinnedIndex.value - 1 + pinnedMessages.value.length) % pinnedMessages.value.length
	}

	/** Скролл к закрепленному сообщению */
	function handleScrollToPinned(messageId: string): void {
		const element = document.getElementById(`msg-${messageId}`)
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'center' })
			element.classList.add('base-chat-message-list__item--highlighted')
			setTimeout(() => {
				element.classList.remove('base-chat-message-list__item--highlighted')
			}, 1500)
		}
	}

	return {
		searchQuery,
		isSearching,
		selectedMessageIds,
		replyingTo,
		isInfoOpen,
		activeTab,
		selectedMemberId,
		pinnedMessages,
		currentPinnedIndex,
		currentPinnedMessage,
		filteredMessages,
		allImagesUrls,
		handleMessageSelect,
		handleAvatarClick,
		handleInfoClick,
		handleNextPinned,
		handlePrevPinned,
		handleScrollToPinned,
	}
}
