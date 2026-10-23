/** Composable: вложения поля ввода чата и отправка сообщения */
import { ref } from 'vue'
import { generateId } from '@utils/data/idUtils'
import { formatFileSize } from '@utils/media/fileUtils'
import { toHTMLInputElement } from '@utils/dom/domUtils'
import type { ChatMessageAttachment } from '@components/BaseChat/types/BaseChat.types'
import { checkAttachments, getRejectionMessages, toFileList } from './chatAttachmentLimits'
import type { ChatAttachmentCheck, UseChatAttachmentsOptions } from '../types/useChatInputState.types'

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

/** Сообщает приложению об отказах (`attach-error`) и о принятых файлах (`attach`) */
function reportFiles(emit: UseChatAttachmentsOptions['emit'], check: ChatAttachmentCheck, files: FileList): void {
	if (check.rejections.length > 0) emit('attach-error', check.rejections)
	if (check.accepted.length > 0) emit('attach', toFileList(check.accepted, files))
}

/** Выбор и удаление вложений, отправка текста с вложениями */
function useChatAttachments(options: UseChatAttachmentsOptions) {
	const { emit, text, props } = options
	const fileInputRef = ref<HTMLInputElement | null>(null)
	const attachments = ref<ChatMessageAttachment[]>([])
	const attachmentErrors = ref<string[]>([])

	function triggerFileSelect(): void {
		fileInputRef.value?.click()
	}

	function handleFileChange(event: Event): void {
		const target = toHTMLInputElement(event.target)
		if (!target) return
		/* istanbul ignore next -- defensive */
		if (!target.files || target.files.length === 0) return
		const { accepted, rejections } = checkAttachments(Array.from(target.files), attachments.value.length, props)
		attachmentErrors.value = getRejectionMessages(rejections)
		reportFiles(emit, { accepted, rejections }, target.files)
		for (const file of accepted) attachments.value.push(toChatAttachment(file))
		target.value = ''
	}

	function removeAttachment(index: number): void {
		const attachment = attachments.value[index]
		if (attachment.url.startsWith('blob:')) URL.revokeObjectURL(attachment.url)
		attachments.value.splice(index, 1)
		attachmentErrors.value = []
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
		attachmentErrors.value = []
	}

	return {
		fileInputRef,
		attachments,
		attachmentErrors,
		dismissAttachmentErrors: (): void => {
			attachmentErrors.value = []
		},
		triggerFileSelect,
		handleFileChange,
		removeAttachment,
		sendMessage,
	}
}

export { useChatAttachments }
