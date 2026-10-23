/** Утилиты: проверка, создание и освобождение элементов загрузки файлов */
import { generateId } from '@utils/data/idUtils'
import { getExtension, validateFile } from '@utils/media/fileUtils'
import type { FileUploadContext } from './types/useFileUploadState.types'
import type { UploadedFile } from '@components/BaseFileUpload/types/BaseFileUpload.types'

/** Описание: добавляет ошибку в список и сообщает о ней потребителю */
function reportError(ctx: FileUploadContext, message: string): void {
	ctx.internalErrors.value.push(message)
	ctx.options.onError(message)
}

/** Описание: возвращает файлы, прошедшие проверку размера и типа; ошибки остальных — в список и onError */
function validateFiles(ctx: FileUploadContext, files: File[]): File[] {
	const valid: File[] = []

	for (const file of files) {
		const result = validateFile(file, {
			maxSize: ctx.options.getMaxSize(),
			accept: ctx.options.getAccept(),
		})
		if (result.isValid) {
			valid.push(file)
			continue
		}
		result.errors.forEach(err => reportError(ctx, err))
	}

	return valid
}

/** Описание: objectURL миниатюры изображения; null — не изображение или превью выключены */
function createPreviewUrl(ctx: FileUploadContext, file: File): string | null {
	if (!file.type.startsWith('image/')) return null
	if (!(ctx.options.getAllowPreview?.() ?? true)) return null
	return URL.createObjectURL(file)
}

/** Описание: создаёт элемент списка синхронно (превью — objectURL), поэтому места под maxCount не гоняются */
function buildUploadItem(ctx: FileUploadContext, file: File): UploadedFile {
	return {
		id: generateId(),
		file,
		name: file.name,
		size: file.size,
		type: file.type,
		extension: getExtension(file.name),
		previewUrl: createPreviewUrl(ctx, file),
		status: 'selected',
		progress: 0,
	}
}

/** Описание: добавляет элемент в список и запускает его загрузку (если приложение передало `uploader`) */
function commitUploadItem(ctx: FileUploadContext, item: UploadedFile): void {
	ctx.uploadedFiles.value.push(item)
	ctx.transfer.start(item.id)
}

/** Описание: отменяет загрузку и освобождает превью файла, который больше не выбран */
function disposeItem(ctx: FileUploadContext, item: UploadedFile): void {
	ctx.transfer.abort(item.id)
	if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
}

/** Описание: освобождает файл и сообщает потребителю, что он больше не выбран */
function releaseItem(ctx: FileUploadContext, item: UploadedFile): void {
	disposeItem(ctx, item)
	ctx.options.onRemove(item)
}

export { buildUploadItem, commitUploadItem, disposeItem, releaseItem, reportError, validateFiles }
