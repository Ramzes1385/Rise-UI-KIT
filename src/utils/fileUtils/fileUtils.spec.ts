/**
 * Unit-тесты для fileUtils.
 * Покрывают: getExtension, formatFileSize, getFileIcon,
 * validateFile, formatAcceptHint, createImagePreview.
 */

import '@testing-library/jest-dom/vitest'

import {
	createImagePreview,
	formatAcceptHint,
	formatFileSize,
	getExtension,
	getFileIcon,
	getFileIconName,
	validateFile,
} from './fileUtils'

describe('fileUtils', () => {
	// ── getExtension ──

	describe('getExtension', () => {
		it('возвращает расширение файла', () => {
			expect(getExtension('document.pdf')).toBe('pdf')
		})

		it('возвращает расширение для нескольких точек', () => {
			expect(getExtension('archive.tar.gz')).toBe('gz')
		})

		it('возвращает пустую строку если нет расширения', () => {
			expect(getExtension('README')).toBe('')
		})

		it('возвращает расширение для скрытого файла', () => {
			expect(getExtension('.gitignore')).toBe('gitignore')
		})
	})

	// ── formatFileSize ──

	describe('formatFileSize', () => {
		it('форматирует байты', () => {
			expect(formatFileSize(500)).toBe('500 Б')
		})

		it('форматирует килобайты', () => {
			expect(formatFileSize(1536)).toBe('1.5 КБ')
		})

		it('форматирует мегабайты', () => {
			expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 МБ')
		})

		it('форматирует нулевой размер', () => {
			expect(formatFileSize(0)).toBe('0 Б')
		})

		it('форматирует ровно 1024 байта как КБ', () => {
			expect(formatFileSize(1024)).toBe('1.0 КБ')
		})

		it('форматирует ровно 1048576 байт как МБ', () => {
			expect(formatFileSize(1048576)).toBe('1.0 МБ')
		})
	})

	// ── getFileIcon ──

	describe('getFileIcon', () => {
		it('возвращает иконку для PDF', () => {
			expect(getFileIcon('pdf')).toBe('📄')
		})

		it('возвращает иконку для DOCX без учёта регистра', () => {
			expect(getFileIcon('docx')).toBe('📝')
		})

		it('возвращает скрепку для неизвестного расширения', () => {
			expect(getFileIcon('xyz')).toBe('📎')
		})
	})

	describe('getFileIconName', () => {
		it('возвращает иконку изображения для PNG', () => {
			expect(getFileIconName('photo.PNG')).toBe('file-img')
		})

		it('возвращает иконку TypeScript для ts', () => {
			expect(getFileIconName('script.ts')).toBe('file-ts')
		})

		it('возвращает иконку Vue для vue', () => {
			expect(getFileIconName('Component.vue')).toBe('file-vue')
		})

		it('возвращает иконку архива для zip', () => {
			expect(getFileIconName('archive.zip')).toBe('file-lock')
		})

		it('возвращает иконку по умолчанию для неизвестного расширения', () => {
			expect(getFileIconName('unknown.xyz')).toBe('file-config')
		})

		it('возвращает иконку по умолчанию для файла без расширения', () => {
			expect(getFileIconName('README')).toBe('file-config')
		})
	})

	// ── validateFile ──

	describe('validateFile', () => {
		function createFile(name: string, size: number, type: string): File {
			return new File([new ArrayBuffer(size)], name, { type })
		}

		it('пропускает файл без ограничений', () => {
			const file = createFile('test.pdf', 100, 'application/pdf')
			const result = validateFile(file, {})
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('отклоняет файл превышающий maxSize', () => {
			const file = createFile('big.pdf', 5 * 1024 * 1024, 'application/pdf')
			const result = validateFile(file, { maxSize: 1 })
			expect(result.isValid).toBe(false)
			expect(result.errors[0]).toContain('превышает')
		})

		it('пропускает файл с допустимым расширением', () => {
			const file = createFile('doc.pdf', 100, 'application/pdf')
			const result = validateFile(file, { accept: '.pdf' })
			expect(result.isValid).toBe(true)
		})

		it('отклоняет файл с недопустимым расширением', () => {
			const file = createFile('doc.exe', 100, 'application/x-msdownload')
			const result = validateFile(file, { accept: '.pdf,.doc' })
			expect(result.isValid).toBe(false)
			expect(result.errors[0]).toContain('не поддерживается')
		})

		it('пропускает файл с допустимым MIME-типом', () => {
			const file = createFile('photo.jpg', 100, 'image/jpeg')
			const result = validateFile(file, { accept: 'image/*' })
			expect(result.isValid).toBe(true)
		})

		it('пропускает файл с точным MIME-типом', () => {
			const file = createFile('doc.pdf', 100, 'application/pdf')
			const result = validateFile(file, { accept: 'application/pdf' })
			expect(result.isValid).toBe(true)
		})

		it('отклоняет файл с несоответствующим MIME-типом', () => {
			const file = createFile('doc.pdf', 100, 'application/pdf')
			const result = validateFile(file, { accept: 'text/plain' })
			expect(result.isValid).toBe(false)
		})

		it('отклоняет файл если image/* не совпадает с MIME', () => {
			const file = createFile('doc.pdf', 100, 'application/pdf')
			const result = validateFile(file, { accept: 'image/*' })
			expect(result.isValid).toBe(false)
		})

		it('пропускает файл без maxSize', () => {
			const file = createFile('big.pdf', 10 * 1024 * 1024, 'application/pdf')
			const result = validateFile(file, {})
			expect(result.isValid).toBe(true)
		})

		it('пропускает файл если размер в пределах maxSize', () => {
			const file = createFile('small.pdf', 500 * 1024, 'application/pdf')
			const result = validateFile(file, { maxSize: 1 })
			expect(result.isValid).toBe(true)
		})

		it('пропускает файл со смешанным accept (расширение + MIME)', () => {
			const file = createFile('photo.jpg', 100, 'image/jpeg')
			const result = validateFile(file, { accept: '.pdf,image/*' })
			expect(result.isValid).toBe(true)
		})

		it('применяет maxSize и accept одновременно', () => {
			const file = createFile('big.exe', 5 * 1024 * 1024, 'application/x-msdownload')
			const result = validateFile(file, { maxSize: 1, accept: '.pdf' })
			expect(result.isValid).toBe(false)
			expect(result.errors).toHaveLength(2)
		})
	})

	// ── formatAcceptHint ──

	describe('formatAcceptHint', () => {
		it('форматирует допустимые типы', () => {
			expect(formatAcceptHint('.pdf,.doc')).toBe('.PDF, .DOC')
		})

		it('возвращает пустую строку для пустого accept', () => {
			expect(formatAcceptHint('')).toBe('')
		})
	})

	// ── createImagePreview ──

	describe('createImagePreview', () => {
		it('возвращает null для не-изображения', async () => {
			const file = new File([new ArrayBuffer(10)], 'doc.pdf', { type: 'application/pdf' })
			const result = await createImagePreview(file)
			expect(result).toBeNull()
		})

		it('возвращает data URL для изображения', async () => {
			const file = new File([new ArrayBuffer(10)], 'photo.jpg', { type: 'image/jpeg' })
			const result = await createImagePreview(file)
			expect(result).not.toBeNull()
			expect(result).toContain('data:')
		})

		it('возвращает null при ошибке чтения', async () => {
			const file = new File([new ArrayBuffer(10)], 'photo.jpg', { type: 'image/jpeg' })
			const OriginalFileReader = globalThis.FileReader

			/** Мок, эмулирующий ошибку: onerror = onload, result = null */
			class MockFileReader {
				onload: (() => void) | null = null
				onerror: (() => void) | null = null
				result: string | null = null
				readAsDataURL = vi.fn(() => {
					// В реальном коде: reader.onerror = reader.onload
					// При ошибке вызывается onerror, который уже указывает на onload
					setTimeout(() => {
						this.result = null
						this.onload?.()
					}, 0)
				})
			}

			vi.stubGlobal('FileReader', MockFileReader)
			const result = await createImagePreview(file)
			expect(result).toBeNull()
			vi.stubGlobal('FileReader', OriginalFileReader)
		})
	})
})
