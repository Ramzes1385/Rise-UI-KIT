/** Composable: оркестратор состояния чата */
import { computed, ref, watch } from 'vue'
import { useChatReply } from '@composables/chat/useChatReply'
import { useChatSearch } from '@composables/chat/useChatSearch'
import { useChatInfoPanel } from '@composables/chat/useChatInfoPanel'
import { useChatSelection } from '@composables/chat/useChatSelection'
import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'
import type { UseChatStateEmit, UseChatStateOptions, UseChatStateProps } from './types/useChatState.types'

/**
 * Закреплённые сообщения, как в Telegram: панель показывает последнее закреплённое, а новый закреп — сразу после
 * закрепления. Клик по панели ведёт к показанному сообщению и переключает панель на предыдущее: повторные клики
 * обходят все закрепы по кругу.
 */
function usePinnedMessages(props: UseChatStateProps, options: UseChatStateOptions) {
	const currentPinnedIndex = ref(0)
	const pinnedMessages = computed((): ChatMessage[] => props.messages.filter(message => message.isPinned))
	const step = (offset: 1 | -1): void => {
		const { length } = pinnedMessages.value
		if (length > 1) currentPinnedIndex.value = (currentPinnedIndex.value + offset + length) % length
	}
	watch(
		() => pinnedMessages.value.map(message => message.id),
		(ids, previous = []) => {
			const added = ids.filter(id => !previous.includes(id)).pop()
			if (added !== undefined) currentPinnedIndex.value = ids.indexOf(added)
		},
		{ immediate: true },
	)
	return {
		pinnedMessages,
		currentPinnedIndex,
		currentPinnedMessage: computed((): ChatMessage | null => {
			if (pinnedMessages.value.length === 0) return null
			if (currentPinnedIndex.value >= pinnedMessages.value.length) {
				currentPinnedIndex.value = Math.max(0, pinnedMessages.value.length - 1)
			}
			return pinnedMessages.value[currentPinnedIndex.value] || null
		}),
		handleNextPinned: (): void => step(1),
		handlePrevPinned: (): void => step(-1),
		handleScrollToPinned(messageId: string): void {
			options.scrollToMessage?.(messageId)
			if (pinnedMessages.value[currentPinnedIndex.value]?.id === messageId) step(-1)
		},
	}
}

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

	const pinned = usePinnedMessages(props, options)

	// Глобальный массив картинок для Telegram-like скролла галереи
	const allImagesUrls = computed((): string[] =>
		props.messages.flatMap(message =>
			(message.attachments ?? []).filter(attachment => attachment.type === 'image').map(attachment => attachment.url),
		),
	)

	return {
		searchQuery,
		isSearching,
		selectedMessageIds,
		replyingTo,
		isInfoOpen,
		activeTab,
		selectedMemberId,
		...pinned,
		filteredMessages,
		allImagesUrls,
		handleMessageSelect,
		handleMessageReply,
		handleCancelReply,
		handleAvatarClick,
		handleInfoClick,
		openInfo,
	}
}

export { useChatState }
