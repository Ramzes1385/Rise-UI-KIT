import { foldSearchText } from '../textUtils'

describe('foldSearchText', () => {
	it('нижний регистр и «е» вместо «ё»: «Ёлка» и «елка» совпадают', () => {
		expect(foldSearchText('Ёлка ЁЖИК')).toBe('елка ежик')
		expect(foldSearchText('Café')).toBe('café')
	})
})
