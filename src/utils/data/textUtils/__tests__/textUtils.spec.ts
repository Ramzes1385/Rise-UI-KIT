import { en } from '@/locales/en'
import { ja } from '@/locales/ja'
import { toHalfWidth } from '../textUtils'
import { defineLocale, setLocale } from '@/locales/state'
import { findSearchMatches, foldSearchText, foldSearchTextWithMap, highlightSearchMatches } from '../searchFold'

afterEach(() => {
	setLocale('ru')
})

describe('foldSearchText', () => {
	it('нижний регистр и «е» вместо «ё»: «Ёлка» и «елка» совпадают', () => {
		expect(foldSearchText('Ёлка ЁЖИК')).toBe('елка ежик')
		expect(foldSearchText('Café')).toBe('café')
	})

	it('письмо без регистра (китайский, японский, корейский) не меняется, поиск по подстроке работает', () => {
		for (const text of ['你好世界', 'こんにちは世界', '한국어 텍스트', '𠮷野家']) {
			expect(foldSearchText(text)).toBe(text)
			expect(foldSearchText(text, 'ja-JP')).toBe(text)
			expect(foldSearchText(text, 'zh-CN')).toBe(text)
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
		expect(foldSearchText('你好，World')).toBe('你好,world')
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

describe('foldSearchText: ширина знаков и кана', () => {
	it('знаки препинания полной ширины тоже равны обычным: «，» и «,»; «「」、。» (не ASCII-формы) не меняются', () => {
		expect(foldSearchText('你好，世界！（ok）')).toBe('你好,世界!(ok)')
		expect(foldSearchText('「こんにちは」、世界。')).toBe('「こんにちは」、世界。')
	})

	it('полная ширина равна обычной во всех языках: «ＡＢＣ１２３» и «abc123»', () => {
		for (const locale of ['ru-RU', 'en-US', 'zh-CN', 'ja-JP']) {
			expect(foldSearchText('ＡＢＣ１２３　ｘ', locale)).toBe('abc123 x')
		}
		expect(foldSearchText('Ｔｏｋｙｏ')).toBe('tokyo')
	})

	it('японский: катакана равна хирагане, «ー» и иероглифы не меняются', () => {
		expect(foldSearchText('カタカナ・ひらがな', 'ja-JP')).toBe('かたかな・ひらがな')
		expect(foldSearchText('コーヒー 東京タワー', 'ja-JP')).toBe('こーひー 東京たわー')
		expect(foldSearchText('ヴァイオリン', 'ja-JP')).toBe('ゔぁいおりん')
		expect(foldSearchText('ヽヾ', 'ja-JP')).toBe('ゝゞ')
	})

	it('не японский: кана не сворачивается (китайский и русский текст с катаканой остаётся как есть)', () => {
		expect(foldSearchText('カタカナ', 'zh-CN')).toBe('カタカナ')
		expect(foldSearchText('カタカナ', 'ru-RU')).toBe('カタカナ')
	})

	it('полуширинная кана равна полной, озвончение сливается в один знак: «ｶﾞｷﾞ» = «ガギ» = «がぎ»', () => {
		expect(foldSearchText('ｶﾞｷﾞ', 'ja-JP')).toBe('がぎ')
		expect(foldSearchText('ｶﾞｷﾞ', 'zh-CN')).toBe('ガギ')
		expect(foldSearchText('ﾊﾟﾝ ｱ', 'ja-JP')).toBe('ぱん あ')
		expect(foldSearchText('ｱｲｳ ﾝ', 'ja-JP')).toBe('あいう ん')
	})

	it('язык по умолчанию — язык кита: на японском кана сворачивается', () => {
		setLocale(ja)
		expect(foldSearchText('カタカナ')).toBe('かたかな')
		setLocale('ru')
		expect(foldSearchText('カタカナ')).toBe('カタカナ')
	})

	it('«ё» и составной регистр: свёртка не теряет знаки (İ без точки в турецком, с точкой — в других)', () => {
		expect(foldSearchText('Ёлка', 'ja-JP')).toBe('елка')
		expect(foldSearchText('İ', 'tr-TR')).toBe('i')
		expect(foldSearchText('İ', 'en-US')).toBe('i\u0307')
	})
})

describe('foldSearchTextWithMap', () => {
	it('язык по умолчанию — язык кита', () => {
		expect(foldSearchTextWithMap('Ёлка')).toEqual({ text: 'елка', starts: [0, 1, 2, 3], ends: [1, 2, 3, 4] })
	})

	it('без изменения длины карта не нужна', () => {
		expect(foldSearchTextWithMap('Hello Мир', 'en-US')).toEqual({ text: 'hello мир', starts: null, ends: null })
	})

	it('карта хранит начало и конец исходного знака для каждого знака результата', () => {
		const folded = foldSearchTextWithMap('aｶﾞb', 'ja-JP')
		expect(folded.text).toBe('aがb')
		expect(folded.starts).toEqual([0, 1, 3])
		expect(folded.ends).toEqual([1, 3, 4])
	})

	it('составной регистр: знак, превратившийся в два, делит исходный диапазон', () => {
		const folded = foldSearchTextWithMap('İx', 'en-US')
		expect(folded.text).toBe('i\u0307x')
		expect(folded.starts).toEqual([0, 0, 1])
		expect(folded.ends).toEqual([1, 1, 2])
	})

	it('пары суррогатов считаются одним знаком', () => {
		const folded = foldSearchTextWithMap('𠮷Ａ', 'ja-JP')
		expect(folded.text).toBe('𠮷a')
		expect(folded.starts).toEqual([0, 0, 2])
	})
})

describe('findSearchMatches и highlightSearchMatches', () => {
	it('диапазоны точны, когда длина свёрнутой строки отличается: «ｶﾞ» в середине', () => {
		const text = 'アｶﾞイ'
		expect(findSearchMatches(text, 'が', 'ja-JP')).toEqual([{ start: 1, end: 3 }])
		expect(text.slice(1, 3)).toBe('ｶﾞ')
		expect(findSearchMatches(text, 'いガ', 'ja-JP')).toEqual([])
		expect(findSearchMatches(text, 'あガイ', 'ja-JP')).toEqual([{ start: 0, end: 4 }])
	})

	it('полная ширина: запрос обычными буквами находит ＡＢＣ и подсвечивает исходный текст', () => {
		expect(highlightSearchMatches('ＡＢＣ def', 'abc', 'en-US')).toEqual([
			{ text: 'ＡＢＣ', isMatch: true },
			{ text: ' def', isMatch: false },
		])
		expect(highlightSearchMatches('abc ＤＥＦ', 'ｄｅｆ', 'en-US')).toEqual([
			{ text: 'abc ', isMatch: false },
			{ text: 'ＤＥＦ', isMatch: true },
		])
	})

	it('хирагана находит катакану и наоборот (японский)', () => {
		expect(highlightSearchMatches('東京タワーと東京とうきょう', 'とうきょう', 'ja-JP')).toEqual([
			{ text: '東京タワーと東京', isMatch: false },
			{ text: 'とうきょう', isMatch: true },
		])
		expect(highlightSearchMatches('トウキョウ タワー', 'とうきょう', 'ja-JP')).toEqual([
			{ text: 'トウキョウ', isMatch: true },
			{ text: ' タワー', isMatch: false },
		])
		expect(highlightSearchMatches('とうきょう', 'トウキョウ', 'ja-JP')).toEqual([{ text: 'とうきょう', isMatch: true }])
	})

	it('несколько совпадений, подряд идущие и по краям; нет совпадений и пустой запрос — одна часть', () => {
		expect(highlightSearchMatches('ababab', 'ab', 'en-US')).toEqual([
			{ text: 'ab', isMatch: true },
			{ text: 'ab', isMatch: true },
			{ text: 'ab', isMatch: true },
		])
		expect(highlightSearchMatches('xAbx', 'ab', 'en-US')).toEqual([
			{ text: 'x', isMatch: false },
			{ text: 'Ab', isMatch: true },
			{ text: 'x', isMatch: false },
		])
		expect(highlightSearchMatches('abc', 'z', 'en-US')).toEqual([{ text: 'abc', isMatch: false }])
		expect(highlightSearchMatches('abc', '', 'en-US')).toEqual([{ text: 'abc', isMatch: false }])
		expect(highlightSearchMatches('', 'a', 'en-US')).toEqual([{ text: '', isMatch: false }])
	})

	it('«ё» и «е»: найденный фрагмент — исходные буквы', () => {
		expect(highlightSearchMatches('Ёлка и ёж', 'ел', 'ru-RU')).toEqual(
			[
				{ text: 'Ел', isMatch: true },
				{ text: 'ка и ёж', isMatch: false },
			].map(part => (part.isMatch ? { text: 'Ёл', isMatch: true } : part)),
		)
	})

	it('язык по умолчанию — язык кита', () => {
		setLocale(ja)
		expect(findSearchMatches('カタカナ', 'かな')).toEqual([{ start: 2, end: 4 }])
		setLocale('ru')
		expect(findSearchMatches('カタカナ', 'かな')).toEqual([])
	})

	it('диапазон при составном регистре захватывает исходный знак целиком', () => {
		expect(findSearchMatches('İx', 'i', 'en-US')).toEqual([{ start: 0, end: 1 }])
		expect(findSearchMatches('aİx', 'x', 'en-US')).toEqual([{ start: 2, end: 3 }])
	})
})
