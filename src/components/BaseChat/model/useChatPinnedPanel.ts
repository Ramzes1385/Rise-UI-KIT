import { computed } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import type { ChatMessage } from '../types/BaseChat.types'
import type { ChatPinnedPanelEmits, ChatPinnedPanelProps } from '../types/ChatPinnedPanel.types'

function previewText(message: ChatMessage): string {
	const text = message.text || ''
	if (!message.attachments || message.attachments.length === 0) return text
	const hasImage = message.attachments.some(attachment => attachment.type === 'image')
	const prefix = hasImage ? `🖼️ ${UI_CHAT_TEXT.PHOTO}` : `📎 ${UI_CHAT_TEXT.FILE}`
	return text ? `${prefix}: ${text}` : prefix
}

export function useChatPinnedPanel(props: ChatPinnedPanelProps, emit: ChatPinnedPanelEmits) {
	const displayIndex = computed((): number => Math.max(0, Math.min(props.currentIndex, props.pinnedMessages.length - 1)))
	const currentMessage = computed((): ChatMessage | null => {
		return props.pinnedMessages[displayIndex.value] || null
	})
	const step = (offset: 1 | -1): void => {
		const len = props.pinnedMessages.length
		if (len <= 1) return
		emit('update:currentIndex', (displayIndex.value + offset + len) % len)
	}

	return {
		displayIndex,
		currentMessageText: computed((): string => {
			if (!currentMessage.value) return ''
			return previewText(currentMessage.value)
		}),
		handlePrev: (): void => step(-1),
		handleNext: (): void => step(1),
		handlePanelClick(): void {
			if (currentMessage.value) emit('click', currentMessage.value.id)
		},
		handleUnpin(): void {
			if (currentMessage.value) emit('unpin', currentMessage.value.id)
		},
	}
}
