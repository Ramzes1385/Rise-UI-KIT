/**
 * Результат поиска ближайшего токена слева
 */
export interface NearestTokenResult {
	/** Позиция в маске */
	maskPos: number
	/** Индекс в чистом значении */
	valueIndex: number
}

export interface UseInputMaskOptions {
	/** Маска ввода */
	getMask: () => string
}

/** Что возвращает useInputMask: функции маски с явной маской и те же операции по текущей маске из `getMask` */
export interface UseInputMaskReturn {
	/** Наложить маску на чистое значение */
	applyMask: (value: string, mask: string) => string
	/** Снять маску: оставить только символы, попавшие в токены */
	stripMask: (value: string, mask: string) => string
	/** Сколько символов значения вмещает маска */
	getMaxTokenCount: (mask: string) => number
	/** Позиция в маске для индекса в чистом значении */
	getMaskPosition: (valueIndex: number, mask: string) => number
	/** Ближайший токен слева от позиции в маске */
	findNearestTokenLeft: (maskPos: number, mask: string) => NearestTokenResult
	/** Наложить текущую маску */
	maskValue: (value: string) => string
	/** Снять текущую маску */
	unmaskValue: (value: string) => string
	/** Обрезать чистое значение до вместимости текущей маски */
	limitValue: (value: string) => string
	/** Позиция курсора после ввода — по длине чистого значения */
	cursorAfterInput: (cleanLength: number) => number
	/** Позиция курсора после Backspace */
	cursorAfterBackspace: (cursorPos: number) => NearestTokenResult
	/** Позиция курсора после Delete */
	cursorAfterDelete: (cursorPos: number) => NearestTokenResult
}

/** Проход по маске при наложении и снятии маски */
export interface MaskScanState {
	/** Собранный результат */
	result: string
	/** Позиция в маске */
	maskIndex: number
	/** Позиция в исходной строке */
	valueIndex: number
}

/** Проход по маске при поиске позиции курсора */
export interface MaskPositionState {
	/** Найденная позиция курсора в маске */
	pos: number
	/** Позиция в маске */
	maskIndex: number
	/** Сколько фиксированных токенов уже пройдено */
	valueIndex: number
}
