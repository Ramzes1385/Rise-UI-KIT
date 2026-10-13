/** Composable: оркестратор состояния чата */
import { computed, nextTick, ref, watch } from 'vue'
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
 * Закрепа нет в загруженной части истории (`messages`) — вместо прокрутки событие `jump-to-message`: приложение подгружает
 * сообщение, и как только оно появляется в `messages`, лента прокручивается к нему.
 */
function usePinnedMessages(props: UseChatStateProps, emit: UseChatStateEmit, options: UseChatStateOptions) {
	const currentPinnedIndex = ref(0)
	const pendingJumpId = ref<string | null>(null)
	const isLoaded = (id: string): boolean => props.messages.some(message => message.id === id)
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
	watch(
		() => pendingJumpId.value !== null && isLoaded(pendingJumpId.value),
		isReady => {
			const id = pendingJumpId.value
			if (!isReady || id === null) return
			pendingJumpId.value = null
			nextTick(() => options.scrollToMessage?.(id))
		},
	)
	return {
		pinnedMessages,
		currentPinnedIndex,
		cancelPendingJump(): void {
			pendingJumpId.value = null
		},
		handleScrollToPinned(messageId: string): void {
			if (isLoaded(messageId)) options.scrollToMessage?.(messageId)
			else {
				pendingJumpId.value = messageId
				emit('jump-to-message', messageId)
			}
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

/** Сообщение ещё не ушло: правке подлежат только отправленные */
function isUnsent(message: ChatMessage): boolean {
	return message.status === 'sending' || message.status === 'failed'
}

/** Стрелка вверх в пустом поле: правка последнего своего отправленного сообщения с текстом */
function editLastMessage(messages: ChatMessage[], edit: (message: ChatMessage) => void): void {
	const last = [...messages].reverse().find(message => message.sender === 'me' && message.text && !isUnsent(message))
	if (last) edit(last)
}

/** Оркестратор состояния чата — объединяет поиск, выделение, панель информации, ответ, правку, закреплённые сообщения. */
function useChatState(props: UseChatStateProps, emit: UseChatStateEmit, options: UseChatStateOptions = {}) {
	const { searchQuery, isSearching, filteredMessages } = useChatSearch({ getMessages: () => props.messages })
	const { selectedMessageIds, handleMessageSelect, selectAll, handleSelectionEscape } = useChatSelection({
		onMessageSelect: messageId => emit('message-select', messageId),
	})
	const info = useChatInfoPanel({ onAvatarClick: senderId => emit('avatar-click', senderId), onInfoClick: () => emit('info-click') })
	const { replyingTo, handleMessageReply, handleCancelReply } = useChatReply()
	const { editingMessage, handleMessageEdit, handleCancelEdit } = useChatEdit()
	const pinned = usePinnedMessages(props, emit, options)
	watch(searchQuery, query => emit('search', query))
	watch(
		() => props.chatId,
		() => {
			handleCancelReply()
			handleCancelEdit()
			selectedMessageIds.value = []
			isSearching.value = false
			searchQuery.value = ''
			info.closeInfo()
			pinned.currentPinnedIndex.value = 0
			pinned.cancelPendingJump()
		},
	)

	return {
		searchQuery,
		isSearching,
		selectedMessageIds,
		replyingTo,
		editingMessage,
		...info,
		...pinned,
		filteredMessages,
		allImagesUrls: useAllImages(props),
		handleMessageSelect,
		handleSelectAll: () => selectAll(filteredMessages.value.map(message => message.id)),
		handleSelectionEscape,
		handleMessageReply,
		handleCancelReply,
		handleEditLast: () => editLastMessage(props.messages, handleMessageEdit),
		handleMessageEdit,
		handleCancelEdit,
	}
}

export { useChatState }
