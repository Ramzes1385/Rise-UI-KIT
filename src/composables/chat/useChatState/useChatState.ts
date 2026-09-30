/** Composable: оркестратор состояния чата */
import { computed, ref } from 'vue'
import { useChatReply } from '@composables/chat/useChatReply'
import { useChatSearch } from '@composables/chat/useChatSearch'
import { useChatInfoPanel } from '@composables/chat/useChatInfoPanel'
import { useChatSelection } from '@composables/chat/useChatSelection'
import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'
import type { UseChatStateEmit, UseChatStateOptions, UseChatStateProps } from './types/useChatState.types'

/** Оркестратор состояния чата — объединяет поиск, выделение, панель информации, ответ, закреплённые сообщения. */
function useChatState(props: UseChatStateProps, emit: UseChatStateEmit, options: UseChatStateOptions = {}) {
	const { searchQuery, isSearching, filteredMessages } = useChatSearch({ getMessages: () => props.messages })
	const { selectedMessageIds, handleMessageSelect } = useChatSelection({
		onMessageSelect: messageId => emit('message-select', messageId),
	})
	const { isInfoOpen, activeTab, selectedMemberId, handleAvatarClick, handleInfoClick, openInfo } = useChatInfoPanel({
		onAvatarClick: senderId => emit('avatar-click', senderId),
		onInfoClick: () => emit('info-click'),
	})
	const { replyingTo, handleMessageReply, handleCancelReply } = useChatReply()

	const currentPinnedIndex = ref(0)
	const pinnedMessages = computed((): ChatMessage[] => {
		return props.messages.filter(message => message.isPinned)
	})
	const currentPinnedMessage = computed((): ChatMessage | null => {
		if (pinnedMessages.value.length === 0) return null
		if (currentPinnedIndex.value >= pinnedMessages.value.length) {
			currentPinnedIndex.value = Math.max(0, pinnedMessages.value.length - 1)
		}
		return pinnedMessages.value[currentPinnedIndex.value] || null
	})

	// Глобальный массив картинок для Telegram-like скролла галереи
	const allImagesUrls = computed((): string[] =>
		props.messages.flatMap(message =>
			(message.attachments ?? []).filter(attachment => attachment.type === 'image').map(attachment => attachment.url),
		),
	)

	function handleNextPinned(): void {
		if (pinnedMessages.value.length <= 1) return
		currentPinnedIndex.value = (currentPinnedIndex.value + 1) % pinnedMessages.value.length
	}

	function handlePrevPinned(): void {
		if (pinnedMessages.value.length <= 1) return
		currentPinnedIndex.value = (currentPinnedIndex.value - 1 + pinnedMessages.value.length) % pinnedMessages.value.length
	}

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
		openInfo,
		handleNextPinned,
		handlePrevPinned,
		handleScrollToPinned,
	}
}

export { useChatState }
