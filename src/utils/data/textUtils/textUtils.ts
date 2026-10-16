/** Утилиты: полноширинные символы CJK-ввода в обычные */
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

export { toHalfWidth }
