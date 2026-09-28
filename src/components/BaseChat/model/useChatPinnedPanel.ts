/** Composable: логика ChatPinnedPanel — закреплённые сообщения: превью текста и переход между ними по кругу */
import { computed } from 'vue'
import { UI_CHAT_TEXT } from '@/locales/messages'
import type { ChatMessage } from '../types/BaseChat.types'
import type { ChatPinnedPanelEmits, ChatPinnedPanelProps } from '../types/ChatPinnedPanel.types'

/** Превью сообщения: у вложений — пометка «Фото» или «Файл» перед текстом */
function previewText(message: ChatMessage): string {
	const text = message.text || ''
	if (!message.attachments || message.attachments.length === 0) return text
	const hasImage = message.attachments.some(attachment => attachment.type === 'image')
	const prefix = hasImage ? `🖼️ ${UI_CHAT_TEXT.PHOTO}` : `📎 ${UI_CHAT_TEXT.FILE}`
	return text ? `${prefix}: ${text}` : prefix
}

export function useChatPinnedPanel(props: ChatPinnedPanelProps, emit: ChatPinnedPanelEmits) {
	const currentMessage = computed((): ChatMessage | null => {
		/* istanbul ignore next — defensive: панель скрыта при pinnedMessages пустом (v-if) */
		return props.pinnedMessages[props.currentIndex] || null
	})
	const step = (offset: 1 | -1): void => {
		const len = props.pinnedMessages.length
		/* istanbul ignore next — defensive: navigation-кнопки скрыты при len <= 1 (v-if) */
		if (len <= 1) return
		emit('update:currentIndex', (props.currentIndex + offset + len) % len)
	}

	return {
		currentMessageText: computed((): string => {
			/* istanbul ignore next — defensive: панель скрыта при отсутствии currentMessage */
			if (!currentMessage.value) return ''
			return previewText(currentMessage.value)
		}),
		handlePrev: (): void => step(-1),
		handleNext: (): void => step(1),
		handlePanelClick(): void {
			/* istanbul ignore next — defensive: панель скрыта при пустом currentMessage */
			if (currentMessage.value) emit('click', currentMessage.value.id)
		},
		handleUnpin(): void {
			/* istanbul ignore next — defensive: unpin-кнопка скрыта при пустом currentMessage */
			if (currentMessage.value) emit('unpin', currentMessage.value.id)
		},
	}
}
