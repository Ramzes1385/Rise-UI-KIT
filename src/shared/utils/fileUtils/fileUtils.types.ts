/** Результат валидации файла */
interface FileValidationResult {
	/** Прошёл ли файл валидацию */
	isValid: boolean
	/** Сообщение об ошибке (если не прошёл) */
	error: string
}

/** Параметры валидации файла */
interface FileValidationOptions {
	/** Максимальный размер в МБ */
	maxSize?: number
	/** Допустимые MIME-типы и расширения (через запятую) */
	accept?: string
}

export type { FileValidationOptions, FileValidationResult }
