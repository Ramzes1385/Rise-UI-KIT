/** Утилиты: свёртка текста для поиска (регистр, «ё», ширина знаков, кана) и точные диапазоны совпадений для подсветки */
import { getLocale } from '@/locales/state'
import type { FoldedText, HighlightPart, TextRange } from './types/searchFold.types'

const HALFWIDTH_KANA = /[ｦ-ﾝ][ﾞﾟ]?/
const NEEDS_FOLD = /[ёЁ\u3000ァ-ヾ！-ﾟ]/
const UNIT = /[ｦ-ﾝ][ﾞﾟ]?|[\s\S]/gu
const FULLWIDTH_ASCII = /[！-～]/g
const FULLWIDTH_OFFSET = 0xfee0
const KATAKANA = /[ァ-ヶヽヾ]/g
const KATAKANA_TO_HIRAGANA = 0x60

function isJapanese(locale: string): boolean {
	return locale.split('-')[0].toLowerCase() === 'ja'
}

/** Знак (или пара «полуширинная кана + знак озвончения») в свёрнутый вид без учёта регистра */
function foldUnit(unit: string, isJa: boolean): string {
	let result = unit
	if (HALFWIDTH_KANA.test(result)) result = result.normalize('NFKC')
	result = result
		.replace(FULLWIDTH_ASCII, char => String.fromCharCode(char.charCodeAt(0) - FULLWIDTH_OFFSET))
		.replace(/\u3000/g, ' ')
		.replace(/ё/g, 'е')
	return isJa ? result.replace(KATAKANA, char => String.fromCharCode(char.charCodeAt(0) - KATAKANA_TO_HIRAGANA)) : result
}

/** Свёртка по знакам с картой смещений: каждый знак результата помнит, из какого фрагмента исходной строки он получен */
function foldByUnits(text: string, lower: string, locale: string): FoldedText {
	const isJa = isJapanese(locale)
	const sourceText = lower.length === text.length ? lower : text
	const isAligned = sourceText === lower
	const parts: string[] = []
	const starts: number[] = []
	const ends: number[] = []
	for (const match of sourceText.matchAll(UNIT)) {
		const index = match.index ?? 0
		const unit = isAligned ? match[0] : match[0].toLocaleLowerCase(locale)
		const folded = foldUnit(unit, isJa)
		parts.push(folded)
		for (let offset = 0; offset < folded.length; offset++) {
			starts.push(index)
			ends.push(index + match[0].length)
		}
	}
	return { text: parts.join(''), starts, ends }
}

/**
 * Свёртка текста для поиска вместе с картой смещений. Регистр — по правилам языка (`locale`, по умолчанию язык кита),
 * «ё» равна «е», знаки полной ширины (`ＡＢＣ１２３`) равны обычным, полуширинная кана (`ｶﾞ`) — полной, а для японского
 * катакана равна хирагане. Письмо без регистра (китайский, корейский) и иероглифы не меняются.
 */
export function foldSearchTextWithMap(text: string, locale: string = getLocale().intl): FoldedText {
	const lower = text.toLocaleLowerCase(locale)
	if (lower.length === text.length && !NEEDS_FOLD.test(lower)) return { text: lower, starts: null, ends: null }
	return foldByUnits(text, lower, locale)
}

/**
 * Текст для поиска без различия регистра, «е» и «ё», полной и половинной ширины, а для японского — хираганы и катаканы:
 * «Ёлка» и «елка», «ＡＢＣ» и «abc», «カタカナ» и «かたかな» совпадают. Регистр — по правилам языка кита (`locale.intl`, например турецкое «İ»).
 * Длина результата может отличаться от исходной (`ｶﾞ` → один знак): для подсветки совпадений используйте `findSearchMatches`.
 */
export function foldSearchText(text: string, locale: string = getLocale().intl): string {
	return foldSearchTextWithMap(text, locale).text
}

/** Диапазоны исходной строки, где найден запрос: без различия регистра, ширины и каны; диапазоны не пересекаются и идут по порядку */
export function findSearchMatches(text: string, query: string, locale: string = getLocale().intl): TextRange[] {
	const needle = foldSearchText(query, locale)
	if (!needle) return []
	const folded = foldSearchTextWithMap(text, locale)
	const { starts, ends } = folded
	const ranges: TextRange[] = []
	for (let at = folded.text.indexOf(needle); at !== -1; at = folded.text.indexOf(needle, at + needle.length)) {
		const last = at + needle.length - 1
		ranges.push(starts && ends ? { start: starts[at], end: ends[last] } : { start: at, end: last + 1 })
	}
	return ranges
}

/** Текст по частям для подсветки: найденные фрагменты помечены `isMatch`, остальное — между ними; нет совпадений — одна часть */
export function highlightSearchMatches(text: string, query: string, locale?: string): HighlightPart[] {
	const parts: HighlightPart[] = []
	let from = 0
	for (const { start, end } of findSearchMatches(text, query, locale)) {
		if (start > from) parts.push({ text: text.slice(from, start), isMatch: false })
		parts.push({ text: text.slice(start, end), isMatch: true })
		from = end
	}
	if (from < text.length || parts.length === 0) parts.push({ text: text.slice(from), isMatch: false })
	return parts
}
