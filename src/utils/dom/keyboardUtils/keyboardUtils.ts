/** Утилиты: какая буква сочетания клавиш нажата, независимо от раскладки */

const LATIN_LETTER = /^[a-z]$/i
const ASCII_CHAR = /^[ -~]$/
const LETTER_CODE = /^Key([A-Z])$/

/**
 * Буква нажатия для горячих клавиш: латинская буква из `event.key`, иначе буква физической клавиши из `event.code`.
 * Dvorak и Colemak: клавиша с нужной буквой (по `key`; знак вроде «;» на физической KeyZ — не Z). Русская и другие
 * нелатинские раскладки: `key` не ASCII, берётся физическая клавиша (`я` на `KeyZ` — это Z). QWERTZ: Z и Y
 * поменялись местами, `key` их различает. Не буква — пустая строка.
 * Ограничение (решение осознанное): клавиша, на которой нелатинская раскладка печатает ASCII-знак не букву (греческая Q — «;»,
 * ивритские Q и W — «/» и «'»), буквой не считается и не срабатывает. Тот же знак на Dvorak стоит на другой физической
 * клавише, и без API раскладки отличить эти случаи нельзя; ложное срабатывание на Dvorak хуже пропуска на двух клавишах.
 */
function getShortcutLetter(event: Pick<KeyboardEvent, 'code' | 'key'>): string {
	if (ASCII_CHAR.test(event.key)) return LATIN_LETTER.test(event.key) ? event.key.toLowerCase() : ''
	return LETTER_CODE.exec(event.code)?.[1]?.toLowerCase() ?? ''
}

export { getShortcutLetter }
