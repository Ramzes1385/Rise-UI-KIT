import { en } from '@/locales/en'
import { foldSearchText } from '../textUtils'
import { defineLocale, setLocale } from '@/locales/state'

afterEach(() => {
	setLocale('ru')
})

describe('foldSearchText', () => {
	it('нижний регистр и «е» вместо «ё»: «Ёлка» и «елка» совпадают', () => {
		expect(foldSearchText('Ёлка ЁЖИК')).toBe('елка ежик')
		expect(foldSearchText('Café')).toBe('café')
	})

	it('письмо без регистра (китайский, японский, корейский) не меняется, поиск по подстроке работает', () => {
		for (const text of ['你好，世界', 'こんにちは世界', 'カタカナ・ひらがな', '한국어 텍스트', '𠮷野家']) {
			expect(foldSearchText(text)).toBe(text)
			expect(foldSearchText(text, 'ja-JP')).toBe(text)
		}
		expect(foldSearchText('東京タワー 2024').includes(foldSearchText('タワー'))).toBe(true)
		expect(foldSearchText('Tokyo 東京').includes(foldSearchText('TOKYO'))).toBe(true)
	})

	it('регистр по языку: аргумент или язык кита; турецкая «I» без точки', () => {
		expect(foldSearchText('ISPARTA', 'tr-TR')).toBe('ısparta')
		expect(foldSearchText('ISPARTA', 'en-US')).toBe('isparta')

		setLocale(defineLocale(en, { code: 'tr', intl: 'tr-TR' }))
		expect(foldSearchText('ISPARTA')).toBe('ısparta')
		setLocale('en')
		expect(foldSearchText('ISPARTA')).toBe('isparta')
	})
})
