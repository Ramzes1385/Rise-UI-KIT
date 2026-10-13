import { computed, ref, watch } from 'vue'
/** Composable: оркестратор состояния чата */
import { useChatEdit } from '@composables/chat/useChatEdit'
import { useChatReply } from '@composables/chat/useChatReply'
import { useChatSearch } from '@composables/chat/useChatSearch'
import { useChatInfoPanel } from '@composables/chat/useChatInfoPanel'
import { useChatSelection } from '@composables/chat/useChatSelection'
import type { ChatMessage } from '@components/BaseChat/types/BaseChat.types'
import type { UseChatStateEmit, UseChatStateOptions, UseChatStateProps } from './types/useChatState.types'

/**
 * Закреплённые сообщения, как в Telegram: панель показывает последнее закреплённое, а новый закреп — сразу после
 * закрепления. Клик по панели ведёт к показанному сообщению и переключает панель на предыдущее: повторные клики
 * обходят все закрепы по кругу. Список — проп `pinnedMessages`, а без него — `messages[].isPinned`. Индекс не выходит
 * за список: после открепления последнего по порядку закрепа панель показывает новый последний, а не «3 из 2».
 */
function usePinnedMessages(props: UseChatStateProps, options: UseChatStateOptions) {
	const currentPinnedIndex = ref(0)
	const pinnedMessages = computed((): ChatMessage[] => props.pinnedMessages ?? props.messages.filter(message => message.isPinned))
	const step = (offset: 1 | -1): void => {
		const { length } = pinnedMessages.value
		if (length > 1) currentPinnedIndex.value = (currentPinnedIndex.value + offset + length) % length
	}
	watch(
		() => pinnedMessages.value.map(message => message.id),
		(ids, previous = []) => {
			const added = ids.filter(id => !previous.includes(id)).pop()
			if (added !== undefined) currentPinnedIndex.value = ids.indexOf(added)
			else currentPinnedIndex.value = Math.max(0, Math.min(currentPinnedIndex.value, ids.length - 1))
		},
		{ immediate: true },
	)
	return {
		pinnedMessages,
		currentPinnedIndex,
		handleScrollToPinned(messageId: string): void {
			options.scrollToMessage?.(messageId)
			if (pinnedMessages.value[currentPinnedIndex.value]?.id === messageId) step(-1)
		},
	}
}

/** Адреса всех картинок чата подряд — для галереи с прокруткой между фото, как в Telegram */
function useAllImages(props: UseChatStateProps) {
	return computed((): string[] =>
		props.messages.flatMap(message =>
			(message.attachments ?? []).filter(attachment => attachment.type === 'image').map(attachment => attachment.url),
		),
	)
}

/** Оркестратор состояния чата — объединяет поиск, выделение, панель информации, ответ, правку, закреплённые сообщения. */
function useChatState(props: UseChatStateProps, emit: UseChatStateEmit, options: UseChatStateOptions = {}) {
	const { searchQuery, isSearching, filteredMessages } = useChatSearch({ getMessages: () => props.messages })
	const { selectedMessageIds, handleMessageSelect } = useChatSelection({
		onMessageSelect: messageId => emit('message-select', messageId),
	})
	const { isInfoOpen, activeTab, selectedMemberId, handleAvatarClick, handleInfoClick, openInfo, closeInfo } = useChatInfoPanel({
		onAvatarClick: senderId => emit('avatar-click', senderId),
		onInfoClick: () => emit('info-click'),
	})
	const { replyingTo, handleMessageReply, handleCancelReply } = useChatReply()
	const { editingMessage, handleMessageEdit, handleCancelEdit } = useChatEdit()

	const pinned = usePinnedMessages(props, options)

	watch(searchQuery, query => emit('search', query))

	watch(
		() => props.chatId,
		() => {
			handleCancelReply()
			handleCancelEdit()
			selectedMessageIds.value = []
			isSearching.value = false
			searchQuery.value = ''
			closeInfo()
			pinned.currentPinnedIndex.value = 0
		},
	)

	return {
		searchQuery,
		isSearching,
		selectedMessageIds,
		replyingTo,
		editingMessage,
		isInfoOpen,
		activeTab,
		selectedMemberId,
		...pinned,
		filteredMessages,
		allImagesUrls: useAllImages(props),
		handleMessageSelect,
		handleMessageReply,
		handleCancelReply,
		handleMessageEdit,
		handleCancelEdit,
		handleAvatarClick,
		handleInfoClick,
		openInfo,
	}
}

export { useChatState }
