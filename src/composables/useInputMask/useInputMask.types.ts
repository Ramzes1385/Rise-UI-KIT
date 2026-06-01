/**
 * Результат поиска ближайшего токена слева
 */
export interface NearestTokenResult {
	/** Позиция в маске */
	maskPos: number
	/** Индекс в чистом значении */
	valueIndex: number
}

/**
 * Опции composable useInputMask
 */
export interface UseInputMaskOptions {
	/** Маска ввода */
	getMask: () => string
}
