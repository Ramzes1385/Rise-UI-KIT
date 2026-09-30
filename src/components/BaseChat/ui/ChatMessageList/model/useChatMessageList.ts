import { computed } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { useAutoScroll } from '@composables/interaction/useAutoScroll'
import type { ChatBadge, ChatMessage } from '../../../types/BaseChat.types'
import { useChatMessageActions } from '@composables/chat/useChatMessageActions'
import type { ChatMessageListEmits, MessageListProps } from '../types/ChatMessageList.types'

export function useChatMessageList(props: MessageListProps, emit: ChatMessageListEmits) {
	const actions = useChatMessageActions({ selectedMessageIds: computed(() => props.selectedMessageIds), emit })
	const badgesBySender = computed(() => new Map(props.members.map(member => [member.id, member.badges ?? []])))
	useAutoScroll({
		container: actions.listRef,
		enabled: () => true,
		watchSource: () => props.messages.length + (props.isTyping ? 1 : 0),
	})

	return {
		...actions,
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
