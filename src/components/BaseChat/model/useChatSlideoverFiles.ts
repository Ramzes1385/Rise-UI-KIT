import { computed } from 'vue'
import { collectAttachments } from './sharedContent'
import type { ChatSlideoverFilesProps } from '../types/ChatSlideoverFiles.types'

export function useChatSlideoverFiles(props: ChatSlideoverFilesProps) {
	return { files: computed(() => collectAttachments(props.messages, 'file')) }
}
