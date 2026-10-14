/** Утилиты: какая буква сочетания клавиш нажата, независимо от раскладки */

const LATIN_LETTER = /^[a-z]$/i
const ASCII_CHAR = /^[ -~]$/
const LETTER_CODE = /^Key([A-Z])$/

/**
 * Буква нажатия для горячих клавиш: латинская буква из `event.key`, иначе буква физической клавиши из `event.code`.
 * Dvorak и Colemak: клавиша с нужной буквой (по `key`; знак вроде «;» на физической KeyZ — не Z). Русская и другие
 * нелатинские раскладки: `key` не ASCII, берётся физическая клавиша (`я` на `KeyZ` — это Z). QWERTZ: Z и Y
 * поменялись местами, `key` их различает. Не буква — пустая строка.
 */
function getShortcutLetter(event: Pick<KeyboardEvent, 'code' | 'key'>): string {
	if (ASCII_CHAR.test(event.key)) return LATIN_LETTER.test(event.key) ? event.key.toLowerCase() : ''
	return LETTER_CODE.exec(event.code)?.[1]?.toLowerCase() ?? ''
}

export { getShortcutLetter }
