import { getShortcutLetter } from '../keyboardUtils'

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
