/** Текст после свёртки для поиска и карта смещений в исходную строку */
export interface FoldedText {
	/** Свёрнутый текст: без регистра, «е» вместо «ё», ширина и кана приведены */
	text: string
	/** Начало знака исходной строки для каждого знака свёрнутого текста; `null` — длины и смещения совпадают */
	starts: readonly number[] | null
	/** Конец (после последнего знака) того же знака исходной строки */
	ends: readonly number[] | null
}

/** Диапазон в исходной строке: `text.slice(start, end)` — найденный фрагмент */
export interface TextRange {
	start: number
	end: number
}

/** Часть текста для подсветки: `isMatch` — найденный фрагмент */
export interface HighlightPart {
	text: string
	isMatch: boolean
}
