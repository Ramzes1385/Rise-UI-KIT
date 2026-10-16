/** Утилиты: текст для поиска и сравнения по правилам языка кита */
import { getLocale } from '@/locales/state'

/**
 * Текст для поиска без различия регистра и букв «е» и «ё»: «Ёлка» и «елка» совпадают.
 * Регистр — по правилам языка кита (`locale.intl`, например турецкое «İ»); для письма без регистра (китайский, японский)
 * текст не меняется. Длина строки сохраняется, кроме редких букв с составным нижним регистром.
 */
function foldSearchText(text: string, locale: string = getLocale().intl): string {
	return text.toLocaleLowerCase(locale).replace(/ё/g, 'е')
}

export { foldSearchText }
