/** Утилиты: валидация и обработка файлов */

import { UI_TEXT } from '@/locales/messages'
import { formatMessage, formatNumber } from '@/locales/state'
import { DOWNLOAD_PROTOCOLS, isSafeUrl } from '@utils/data/urlUtils'
import type { FileValidationOptions, FileValidationResult } from './types/fileUtils.types'

function getExtension(name: string): string {
	const parts = name.split('.')
	return parts.length > 1 ? parts.pop()! : ''
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${formatNumber(bytes)} ${UI_TEXT.SIZE_B}`
	const fraction = { minimumFractionDigits: 1, maximumFractionDigits: 1 }
	if (bytes < 1024 * 1024) return `${formatNumber(bytes / 1024, fraction)} ${UI_TEXT.SIZE_KB}`
	return `${formatNumber(bytes / (1024 * 1024), fraction)} ${UI_TEXT.SIZE_MB}`
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

/** Карта расширений в имена SVG-иконок файлов */
const FILE_ICON_NAME_MAP: Record<string, string> = {
	png: 'file-img',
	jpg: 'file-img',
	jpeg: 'file-img',
	gif: 'file-img',
	webp: 'file-img',
	svg: 'file-svg',
	js: 'file-js',
	ts: 'file-ts',
	vue: 'file-vue',
	scss: 'file-scss',
	css: 'file-css',
	html: 'file-html',
	json: 'file-json',
	md: 'file-md',
	txt: 'file-txt',
	xml: 'file-xml',
	yaml: 'file-yaml',
	yml: 'file-yaml',
	sh: 'file-sh',
	py: 'file-py',
	sql: 'file-sql',
	pdf: 'file-txt',
	doc: 'file-txt',
	docx: 'file-txt',
	xls: 'file-txt',
	xlsx: 'file-txt',
	ppt: 'file-txt',
	pptx: 'file-txt',
	mp3: 'file-config',
	wav: 'file-config',
	mp4: 'file-config',
	mkv: 'file-config',
	zip: 'file-lock',
	rar: 'file-lock',
	'7z': 'file-lock',
}

function getFileIconName(filename: string): string {
	const ext = getExtension(filename).toLowerCase()
	return FILE_ICON_NAME_MAP[ext] || 'file-config'
}

/** Валидировать файл по размеру и допустимым типам */
function validateFile(file: File, options: FileValidationOptions): FileValidationResult {
	const errors: string[] = []

	if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
		errors.push(formatMessage(UI_TEXT.FILE_TOO_LARGE, { name: file.name, size: formatNumber(options.maxSize) }))
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

/**
 * Скачать файл по URL через программное создание ссылки.
 * URL вложений приходит из данных сообщений: клик по `<a href="javascript:…">` исполнил бы код,
 * поэтому допускаются только http(s), blob:, data: и относительные адреса.
 */
function downloadFile(url: string, filename: string): void {
	if (!isSafeUrl(url, DOWNLOAD_PROTOCOLS)) {
		console.warn(`[rise-ui-kit] Скачивание по небезопасному URL заблокировано: ${String(url).slice(0, 80)}`)
		return
	}
	const link = document.createElement('a')
	link.href = url
	link.download = filename
	link.target = '_blank'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

export { createImagePreview, downloadFile, formatAcceptHint, formatFileSize, getExtension, getFileIcon, getFileIconName, validateFile }
