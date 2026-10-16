import { getShortcutLetter, isImeKeydown } from '../keyboardUtils'

const letter = (key: string, code: string) => getShortcutLetter(new KeyboardEvent('keydown', { key, code }))

describe('getShortcutLetter', () => {
	it('en QWERTY: буква из key, в любом регистре', () => {
		expect(letter('z', 'KeyZ')).toBe('z')
		expect(letter('Z', 'KeyZ')).toBe('z')
	})

	it('ru: нелатинская буква — физическая клавиша по code', () => {
		expect(letter('я', 'KeyZ')).toBe('z')
		expect(letter('и', 'KeyB')).toBe('b')
	})

	it('de QWERTZ: Z и Y поменялись местами — решает key', () => {
		expect(letter('z', 'KeyY')).toBe('z')
		expect(letter('y', 'KeyZ')).toBe('y')
	})

	it('Dvorak: нужная буква на другой физической клавише — решает key', () => {
		expect(letter('z', 'Slash')).toBe('z')
		expect(letter('b', 'KeyN')).toBe('b')
	})

	it('не буква — пустая строка', () => {
		expect(letter('1', 'Digit1')).toBe('')
		expect(letter('Enter', 'Enter')).toBe('')
		expect(letter('я', 'Comma')).toBe('')
		expect(letter(';', 'KeyZ')).toBe('')
		expect(letter('Dead', 'KeyK')).toBe('k')
	})
})

describe('isImeKeydown', () => {
	it.each([
		['композиция идёт (isComposing)', { key: 'Enter', isComposing: true }, true],
		['Safari: compositionend раньше keydown, keyCode 229', { key: 'Enter', keyCode: 229 }, true],
		['обычный Enter', { key: 'Enter', keyCode: 13 }, false],
		['обычная буква', { key: 'a', code: 'KeyA' }, false],
	])('%s', (_name, init, expected) => {
		expect(isImeKeydown(new KeyboardEvent('keydown', init))).toBe(expected)
	})
})
