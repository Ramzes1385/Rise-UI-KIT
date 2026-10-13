import { ref } from 'vue'
import { useUi } from '@composables/base/useUi'
import { useChatState } from '@composables/chat/useChatState'
import { useChatActions } from '@composables/chat/useChatActions'
import type { VoiceRecording } from '@components/BaseVoiceRecorder'
import { isolateFormField } from '@composables/form/useFormContext'
import type { BaseChatEmits, BaseChatProps } from '../types/BaseChat.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useChatDeleteConfirm } from '@composables/chat/useChatDeleteConfirm'
import { useChatMemberConfirm } from '@composables/chat/useChatMemberConfirm'
import type { MessageListExposed } from '@composables/chat/useChatActions/types/useChatActions.types'

export function useBaseChat(props: BaseChatProps, emit: BaseChatEmits) {
	const standard = useStandardBaseComponent('base-chat', props, ['root'])
	isolateFormField()
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
		openInfo: state.openInfo,
		editingMessage: state.editingMessage,
		handleCancelEdit: state.handleCancelEdit,
		isAutoDownload: () => props.autoDownload !== false,
	})
	const memberConfirm = useChatMemberConfirm({
		getMemberName: memberId => props.members?.find(member => member.id === memberId)?.name ?? memberId,
		onKick: memberId => emit('kick-member', memberId),
		onBan: payload => emit('ban-member', payload),
	})

	return {
		...standard,
		ui: useUi(props, 'base-chat'),
		messageListRef,
		...state,
		...deleteConfirm,
		...actions,
		...memberConfirm,
		handleSendVoice(recording: VoiceRecording): void {
			emit('send-voice', { recording, replyToId: state.replyingTo.value?.id || undefined })
			state.handleCancelReply()
		},
	}
}
