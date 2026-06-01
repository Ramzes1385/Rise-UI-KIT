import type { FileValidationOptions, FileValidationResult } from './fileUtils.types'

/** Получить расширение файла из имени */
function getExtension(name: string): string {
	const parts = name.split('.')
	return parts.length > 1 ? parts.pop()! : ''
}

/** Форматировать размер файла в человекочитаемый вид */
function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} Б`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`
	return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

/** Получить эмодзи-иконку по расширению файла */
function getFileIcon(extension: string): string {
	const icons: Record<string, string> = {
		PDF: '📄',
		DOC: '📝',
		DOCX: '📝',
		XLS: '📊',
		XLSX: '📊',
		ZIP: '📦',
		RAR: '📦',
		'7Z': '📦',
		MP3: '🎵',
		WAV: '🎵',
		OGG: '🎵',
		MP4: '🎬',
		AVI: '🎬',
		MOV: '🎬',
		JPG: '🖼️',
		JPEG: '🖼️',
		PNG: '🖼️',
		GIF: '🖼️',
		SVG: '🖼️',
		WEBP: '🖼️',
		TXT: '📃',
		CSV: '📃',
	}
	return icons[extension.toUpperCase()] || '📎'
}

/** Валидировать файл по размеру и допустимым типам */
function validateFile(file: File, options: FileValidationOptions): FileValidationResult {
	const errors: string[] = []

	if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
		errors.push(`Файл "${file.name}" превышает ${options.maxSize} МБ`)
	}

	if (options.accept) {
		const acceptedTypes = options.accept.split(',').map(s => s.trim().toLowerCase())
		const ext = getExtension(file.name).toLowerCase()
		const mime = file.type.toLowerCase()
		const matches = acceptedTypes.some(t => {
			if (t.startsWith('.')) return `.${ext}` === t
			if (t.endsWith('/*')) return mime.startsWith(t.replace('/*', '/'))
			return mime === t
		})
		if (!matches) {
			const hint = formatAcceptHint(options.accept)
			errors.push(`Формат файла "${file.name}" не поддерживается. Допустимые: ${hint}`)
		}
	}

	return { isValid: errors.length === 0, errors }
}

/** Сформировать подсказку по допустимым форматам */
function formatAcceptHint(accept: string): string {
	if (!accept) return ''
	const parts = accept.split(',').map(s => s.trim().toUpperCase())
	return parts.join(', ')
}

/** Создать превью для изображения через FileReader */
function createImagePreview(file: File): Promise<string | null> {
	return new Promise(resolve => {
		if (!file.type.startsWith('image/')) {
			resolve(null)
			return
		}
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = reader.onload
		reader.readAsDataURL(file)
	})
}

export { createImagePreview, formatAcceptHint, formatFileSize, getExtension, getFileIcon, validateFile }
