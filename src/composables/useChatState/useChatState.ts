import { computed, ref } from 'vue'
import { useChatInfoPanel } from '@composables/useChatInfoPanel'
import { useChatReply } from '@composables/useChatReply'
import { useChatSearch } from '@composables/useChatSearch'
import { useChatSelection } from '@composables/useChatSelection'
import type { UseChatStateEmit, UseChatStateOptions, UseChatStateProps } from './useChatState.types'
import type { ChatMessage } from '@components/BaseChat/model/BaseChat.types'

function useChatState(
	props: UseChatStateProps,
	emit: UseChatStateEmit,
	options: UseChatStateOptions = {},
) {
	const { searchQuery, isSearching, filteredMessages } = useChatSearch({ getMessages: () => props.messages })
	const { selectedMessageIds, handleMessageSelect } = useChatSelection({
		onMessageSelect: messageId => emit('message-select', messageId),
	})
	const { isInfoOpen, activeTab, selectedMemberId, handleAvatarClick, handleInfoClick } = useChatInfoPanel({
		onAvatarClick: senderId => emit('avatar-click', senderId),
		onInfoClick: () => emit('info-click'),
	})
	const { replyingTo, handleMessageReply, handleCancelReply } = useChatReply()

	// Управление закрепленными сообщениями (несколько закрепов)
	const currentPinnedIndex = ref(0)
	const pinnedMessages = computed((): ChatMessage[] => {
		return props.messages.filter(message => message.isPinned)
	})
	const currentPinnedMessage = computed((): ChatMessage | null => {
		if (pinnedMessages.value.length === 0) return null
		// Корректируем индекс если он вышел за границы
		if (currentPinnedIndex.value >= pinnedMessages.value.length) {
			currentPinnedIndex.value = Math.max(0, pinnedMessages.value.length - 1)
		}
		return pinnedMessages.value[currentPinnedIndex.value] || null
	})

	// Глобальный массив картинок для Telegram-like скролла галереи
	const allImagesUrls = computed((): string[] => {
		const urls: string[] = []
		for (const message of props.messages) {
			if (message.attachments) {
				for (const attachment of message.attachments) {
					if (attachment.type === 'image') {
						urls.push(attachment.url)
					}
				}
			}
		}
		return urls
	})

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
		options.scrollToMessage?.(messageId)
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
		handleMessageReply,
		handleCancelReply,
		handleAvatarClick,
		handleInfoClick,
		handleNextPinned,
		handlePrevPinned,
		handleScrollToPinned,
	}
}

export { useChatState }
