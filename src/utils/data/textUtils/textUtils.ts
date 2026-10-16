/** Утилиты: текст для поиска и сравнения по правилам языка кита; полноширинные символы CJK-ввода в обычные */
import { getLocale } from '@/locales/state'

/**
 * Текст для поиска без различия регистра и букв «е» и «ё»: «Ёлка» и «елка» совпадают.
 * Регистр — по правилам языка кита (`locale.intl`, например турецкое «İ»); для письма без регистра (китайский, японский)
 * текст не меняется. Длина строки сохраняется, кроме редких букв с составным нижним регистром.
 */
function foldSearchText(text: string, locale: string = getLocale().intl): string {
	return text.toLocaleLowerCase(locale).replace(/ё/g, 'е')
}

const FULLWIDTH_CHARS = /[\uFF01-\uFF5E]/g
const FULLWIDTH_OFFSET = 0xfee0
const IDEOGRAPHIC_SPACE = /\u3000/g

/**
 * Полноширинные формы в обычные: «１２３．５», «ＡＢＣ», «，» → «123.5», «ABC», «,»; идеографический пробел — в обычный.
 * Японский IME по умолчанию вводит цифры полной ширины. Длина строки не меняется (позиция курсора остаётся верной);
 * иероглифы, кана и знаки «、。「」» не затрагиваются.
 */
function toHalfWidth(text: string): string {
	return text.replace(FULLWIDTH_CHARS, char => String.fromCharCode(char.charCodeAt(0) - FULLWIDTH_OFFSET)).replace(IDEOGRAPHIC_SPACE, ' ')
}

export { foldSearchText, toHalfWidth }
