/** Composable: логика BaseChat — состояние чата, выбор и удаление сообщений, действия с сообщениями и участниками */
import { ref } from 'vue'
import { useChatState } from '@composables/useChatState'
import { useChatActions } from '@composables/useChatActions'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useChatDeleteConfirm } from '@composables/useChatDeleteConfirm'
import type { BaseChatEmits, BaseChatProps } from '../types/BaseChat.types'
import type { MessageListExposed } from '@composables/useChatActions/types/useChatActions.types'

export function useBaseChat(props: BaseChatProps, emit: BaseChatEmits) {
	const standard = useStandardBaseComponent('base-chat', props, ['root'])
	const messageListRef = ref<MessageListExposed | null>(null)
	const state = useChatState(props, emit, {
		scrollToMessage: messageId => messageListRef.value?.scrollToMessage(messageId),
	})
	const deleteConfirm = useChatDeleteConfirm({
		selectedMessageIds: state.selectedMessageIds,
		onDelete: ids => emit('delete-messages', ids),
		onForward: ids => emit('forward-messages', ids),
	})
	const actions = useChatActions({
		emit,
		replyingTo: state.replyingTo,
		getAvatar: () => props.avatar,
		messageListRef,
		handleAvatarClick: state.handleAvatarClick,
		handleCancelReply: state.handleCancelReply,
	})

	return { ...standard, messageListRef, ...state, ...deleteConfirm, ...actions }
}
