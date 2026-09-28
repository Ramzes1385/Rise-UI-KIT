/** Результат валидации файла */
interface FileValidationResult {
	/** Прошёл ли файл валидацию */
	isValid: boolean
	/** Список ошибок (если не прошёл) */
	errors: string[]
}

/** Параметры валидации файла */
interface FileValidationOptions {
	/** Максимальный размер в МБ */
	maxSize?: number
	/** Допустимые MIME-типы и расширения (через запятую) */
	accept?: string
}

export type { FileValidationOptions, FileValidationResult }
