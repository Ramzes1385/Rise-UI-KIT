import { validateFile } from '@utils/media/fileUtils'
/** Утилиты: проверка выбранных файлов поля ввода чата по типу, размеру и числу вложений */
import { getLocale, pluralize } from '@/locales/state'
import type { ChatAttachmentRejection } from '@components/BaseChat/types/BaseChat.types'
import type { ChatAttachmentLimits, ChatAttachmentCheck } from '../types/useChatInputState.types'

/** Отказ по типу или размеру: первая ошибка `validateFile` или `undefined`, если файл подходит */
function rejectFile(file: File, limits: ChatAttachmentLimits): ChatAttachmentRejection | undefined {
	const byType = validateFile(file, { accept: limits.accept })
	if (!byType.isValid) return { name: file.name, reason: 'type', message: byType.errors[0] }
	const bySize = validateFile(file, { maxSize: limits.maxFileSize })
	if (!bySize.isValid) return { name: file.name, reason: 'size', message: bySize.errors[0] }
	return undefined
}

/**
 * Делит выбранные файлы на принятые и отклонённые. Отклоняются файлы не того типа (`accept`), больше `maxFileSize` МБ
 * и лишние сверх `maxFiles` с учётом уже прикреплённых; отказов по числу — одно сообщение на всех.
 */
function checkAttachments(files: File[], attachedCount: number, limits: ChatAttachmentLimits): ChatAttachmentCheck {
	const accepted: File[] = []
	const rejections: ChatAttachmentRejection[] = []
	let overflow = ''
	for (const file of files) {
		const rejection = rejectFile(file, limits)
		if (rejection) rejections.push(rejection)
		else if (limits.maxFiles !== undefined && attachedCount + accepted.length >= limits.maxFiles) {
			overflow ||= pluralize(getLocale().plural.CHAT_MAX_FILES, limits.maxFiles)
			rejections.push({ name: file.name, reason: 'count', message: overflow })
		} else accepted.push(file)
	}
	return { accepted, rejections }
}

/** Тексты для пользователя: сообщения отказов без повторов (отказ по числу не дублируется для каждого файла) */
function getRejectionMessages(rejections: ChatAttachmentRejection[]): string[] {
	return [...new Set(rejections.map(rejection => rejection.message))]
}

/** Список файлов для события `attach` из принятых файлов; без `DataTransfer` — исходный список */
function toFileList(accepted: File[], original: FileList): FileList {
	if (accepted.length === original.length || typeof DataTransfer === 'undefined') return original
	const transfer = new DataTransfer()
	for (const file of accepted) transfer.items.add(file)
	return transfer.files
}

export { checkAttachments, getRejectionMessages, toFileList }
