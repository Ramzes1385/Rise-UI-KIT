/** Composable: вложения поля ввода чата и отправка сообщения */
import { ref } from 'vue'
import { generateId } from '@utils/data/idUtils'
import { formatFileSize } from '@utils/media/fileUtils'
import { toHTMLInputElement } from '@utils/dom/domUtils'
import type { UseChatAttachmentsOptions } from './types/useChatInputState.types'
import type { ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'

/** Вложение сообщения из выбранного файла: изображение или файл, адрес blob: и размер для подписи */
function toChatAttachment(file: File): ChatMessageAttachment {
	return {
		id: generateId(),
		name: file.name,
		type: file.type.startsWith('image/') ? 'image' : 'file',
		url: URL.createObjectURL(file),
		size: formatFileSize(file.size),
	}
}

/** Выбор и удаление вложений, отправка текста с вложениями */
function useChatAttachments(options: UseChatAttachmentsOptions) {
	const { emit, text } = options
	const fileInputRef = ref<HTMLInputElement | null>(null)
	const attachments = ref<ChatMessageAttachment[]>([])

	function handleFileChange(event: Event): void {
		const target = toHTMLInputElement(event.target)
		if (!target) return
		/* istanbul ignore next -- defensive */
		if (!target.files || target.files.length === 0) return
		emit('attach', target.files)
		attachments.value.push(...Array.from(target.files, toChatAttachment))
		target.value = ''
	}

	function removeAttachment(index: number): void {
		const attachment = attachments.value[index]
		if (attachment.url.startsWith('blob:')) {
			URL.revokeObjectURL(attachment.url)
		}
		attachments.value.splice(index, 1)
	}

	function sendMessage(messageText = text.value): void {
		const trimmedText = messageText.trim()
		if (!trimmedText && attachments.value.length === 0) return
		emit('send', {
			text: trimmedText,
			attachments: attachments.value.length > 0 ? [...attachments.value] : undefined,
		})
		text.value = ''
		attachments.value = []
	}

	return {
		fileInputRef,
		attachments,
		triggerFileSelect: () => fileInputRef.value?.click(),
		handleFileChange,
		removeAttachment,
		sendMessage,
	}
}

export { useChatAttachments }
