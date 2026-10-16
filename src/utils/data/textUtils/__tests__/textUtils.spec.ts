import { en } from '@/locales/en'
import { defineLocale, setLocale } from '@/locales/state'
import { foldSearchText, toHalfWidth } from '../textUtils'

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

describe('foldSearchText для CJK', () => {
	it('иероглифы и кана без изменений, латиница — в нижний регистр', () => {
		expect(foldSearchText('日本語テキスト')).toBe('日本語テキスト')
		expect(foldSearchText('你好，World')).toBe('你好，world')
	})
})

describe('toHalfWidth', () => {
	it('цифры, латиница и знаки полной ширины — в обычные, длина строки та же', () => {
		expect(toHalfWidth('１２３．５')).toBe('123.5')
		expect(toHalfWidth('ＡＢＣ，－９')).toBe('ABC,-9')
		expect(toHalfWidth('２０２６／１０／１６')).toBe('2026/10/16')
		expect(toHalfWidth('１２３').length).toBe(3)
	})

	it('идеографический пробел — обычный; иероглифы, кана и «、。「」» не меняются', () => {
		expect(toHalfWidth('１　２')).toBe('1 2')
		expect(toHalfWidth('日本語、カタカナ。「ひらがな」')).toBe('日本語、カタカナ。「ひらがな」')
		expect(toHalfWidth('abc 123')).toBe('abc 123')
	})
})
