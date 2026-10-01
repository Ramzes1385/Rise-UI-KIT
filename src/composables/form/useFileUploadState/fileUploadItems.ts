/** Утилиты: проверка, создание и освобождение элементов загрузки файлов */
import { generateId } from '@utils/data/idUtils'
import type { FileUploadContext } from './types/useFileUploadState.types'
import { createImagePreview, getExtension, validateFile } from '@utils/media/fileUtils'
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

/** Описание: создаёт элемент загрузки; файл с превью сразу «загружается», без превью — ждёт */
async function buildUploadItem(file: File): Promise<UploadedFile> {
	const previewUrl = await createImagePreview(file)
	return {
		id: generateId(),
		file,
		name: file.name,
		size: file.size,
		type: file.type,
		extension: getExtension(file.name),
		previewUrl,
		status: previewUrl ? 'uploading' : 'pending',
		progress: 0,
	}
}

/** Описание: добавляет элемент в список и запускает имитацию прогресса для файла с превью */
function commitUploadItem(ctx: FileUploadContext, item: UploadedFile): void {
	ctx.uploadedFiles.value.push(item)
	if (item.previewUrl) {
		ctx.progress.simulate(item.id)
	}
}

/** Описание: освобождает превью и сообщает потребителю, что файл больше не выбран */
function releaseItem(ctx: FileUploadContext, item: UploadedFile): void {
	/* istanbul ignore next — previewUrl присутствует только для image-файлов */
	if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
	ctx.options.onRemove(item)
}

export { buildUploadItem, commitUploadItem, releaseItem, reportError, validateFiles }
