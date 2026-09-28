import { computed } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import { useAutoScroll } from '@composables/useAutoScroll'
import { useChatMessageActions } from '@composables/useChatMessageActions'
import type { ChatMessageListEmits, MessageListProps } from '../types/ChatMessageList.types'

export function useChatMessageList(props: MessageListProps, emit: ChatMessageListEmits) {
	const actions = useChatMessageActions({ selectedMessageIds: computed(() => props.selectedMessageIds), emit })
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
		exposed: { scrollToMessage: actions.scrollToMessage },
	}
}
