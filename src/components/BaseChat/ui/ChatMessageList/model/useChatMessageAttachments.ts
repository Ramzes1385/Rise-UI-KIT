import { computed } from 'vue'
import type { ChatMessageAttachment } from '../../../types/BaseChat.types'
import type { ChatMessageAttachmentsEmits, ChatMessageAttachmentsProps } from '../types/ChatMessageAttachments.types'

export function useChatMessageAttachments(props: ChatMessageAttachmentsProps, emit: ChatMessageAttachmentsEmits) {
	return {
		images: computed(() => props.attachments.filter(attachment => attachment.type === 'image')),
		files: computed(() => props.attachments.filter(attachment => attachment.type !== 'image')),
		handleDownload: (file: ChatMessageAttachment): void => emit('download', file),
		handleFileClick: (file: ChatMessageAttachment): void => emit('file-click', file),
	}
}
