import { UI_CHAT_TEXT } from '@/locales/messages'
import { computed, nextTick, ref, watch } from 'vue'
import { buildChatTimeline } from './timeline/chatTimeline'
import { useChatListScroll } from './timeline/useChatListScroll'
import { useChatMessageMotion } from '../../../model/useChatMessageMotion'
import type { ChatBadge, ChatMessage } from '../../../types/BaseChat.types'
import { useChatMessageActions } from '@composables/chat/useChatMessageActions'
import type { ChatMessageListEmits, MessageListProps } from '../types/ChatMessageList.types'

function useListScroll(props: MessageListProps, emit: ChatMessageListEmits, listRef: Parameters<typeof useChatListScroll>[0]) {
	const last = (): ChatMessage | undefined => props.messages[props.messages.length - 1]
	const motion = useChatMessageMotion(
		() => props.messages.map(message => message.id),
		() => props.searchQuery ?? '',
	)
	const timeline = computed(() =>
		buildChatTimeline({ messages: props.messages, lastReadMessageId: props.lastReadMessageId, today: props.today }),
	)
	const scroll = useChatListScroll(listRef, {
		hasUnread: () => timeline.value.some(item => item.type === 'unread'),
		isLastOwn: () => last()?.sender === 'me',
		getEndKey: () => `${last()?.id}|${props.isTyping}`,
		getLastId: () => last()?.id,
		isSmooth: motion.isAppending,
		getFirstId: () => props.messages[0]?.id,
		hasIdBefore: id => props.messages.findIndex(message => message.id === id) > 0,
		canLoadMore: () => Boolean(props.hasMoreMessages) && !props.isLoadingMore && !props.isLoading,
		onLoadMore: () => emit('load-more'),
	})
	return { motion, timeline, scroll }
}

function useFailedAnnouncement(props: MessageListProps) {
	const announcement = ref('')
	const failedIds = (): Set<string> => new Set(props.messages.filter(message => message.status === 'failed').map(message => message.id))
	let known = failedIds()
	watch(
		() => props.messages,
		() => {
			const current = failedIds()
			const hasNewFailure = [...current].some(id => !known.has(id))
			known = current
			if (!hasNewFailure) return
			announcement.value = ''
			nextTick(() => {
				announcement.value = UI_CHAT_TEXT.STATUS_FAILED
			})
		},
	)
	return announcement
}

export function useChatMessageList(props: MessageListProps, emit: ChatMessageListEmits) {
	const actions = useChatMessageActions({ selectedMessageIds: computed(() => props.selectedMessageIds), emit })
	const badgesBySender = computed(() => new Map(props.members.map(member => [member.id, member.badges ?? []])))
	const { motion, timeline, scroll } = useListScroll(props, emit, actions.listRef)

	return {
		...actions,
		timeline,
		failedAnnouncement: useFailedAnnouncement(props),
		isSearchActive: computed(() => Boolean(props.searchQuery?.trim())),
		hasNewBelow: scroll.hasNewBelow,
		handleJumpToNew: scroll.handleJumpToNew,
		handleListScroll(): void {
			actions.handleListScroll()
			scroll.handleEdgeScroll()
			scroll.handleHistoryScroll()
		},
		enterName: motion.enterName,
		handleBeforeLeave: motion.handleBeforeLeave,
		selectedSet: computed(() => new Set(props.selectedMessageIds)),
		activeContextMessageId: computed(() => actions.contextMenu.value.message?.id ?? null),
		isSelectionMode: computed(() => props.selectedMessageIds.length > 0),
		typingLabel: computed(() =>
			props.typingUsername ? `${props.typingUsername} ${UI_CHAT_TEXT.TYPING_SUFFIX}` : UI_CHAT_TEXT.TYPING_LABEL,
		),
		senderBadges: (message: ChatMessage): ChatBadge[] => badgesBySender.value.get(message.senderId ?? '') ?? [],
		exposed: { scrollToMessage: actions.scrollToMessage },
	}
}
