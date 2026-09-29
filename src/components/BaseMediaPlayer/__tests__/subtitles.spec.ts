import { activeCueText, captionPreset, cueLines, decodeSubtitles, isSubtitleFile, parseSubtitles } from '../model/subtitles'

const BOM = String.fromCharCode(0xfeff)

const NBSP = String.fromCharCode(0xa0)

const VTT = [
	'WEBVTT - Демо',
	'Kind: captions',
	'',
	'NOTE Комментарий',
	'на две строки',
	'',
	'STYLE',
	'::cue { color: red }',
	'',
	'intro',
	'00:01.000 --> 00:04.500 align:start position:10%',
	'<v Ведущий>Привет, <i>мир</i> &amp; <b>все</b></v>',
	'',
	'00:00:05.250 --> 00:00:07.000',
	'Вторая',
	'строка',
].join('\n')

const SRT = `${BOM}${[
	'1',
	'00:00:01,5 --> 00:00:03,000',
	'Hello {\\an8}<font color="#ff0">world</font>',
	'',
	'2',
	'00:00:00,000 --> 00:00:01,000',
	'First',
	'  ',
	'3',
	'block without timing',
	'',
	'4',
	'00:00:09,000 --> 00:00:10,000',
	'',
	'',
].join('\r\n')}`

function bytes(...values: number[]): ArrayBuffer {
	return new Uint8Array(values).buffer
}

describe('parseSubtitles', () => {
	it('WebVTT: пропускает заголовок, NOTE и STYLE, настройки реплики и идентификаторы', () => {
		expect(parseSubtitles(VTT)).toEqual([
			{ start: 1, end: 4.5, text: '<v Ведущий>Привет, <i>мир</i> &amp; <b>все</b></v>' },
			{ start: 5.25, end: 7, text: 'Вторая\nстрока' },
		])
	})

	it('SubRip: BOM, CRLF, запятая в миллисекундах, короткие доли, пустые реплики; реплики по порядку', () => {
		expect(parseSubtitles(SRT)).toEqual([
			{ start: 0, end: 1, text: 'First' },
			{ start: 1.5, end: 3, text: 'Hello {\\an8}<font color="#ff0">world</font>' },
		])
	})

	it('часы любой длины и пустой файл', () => {
		expect(parseSubtitles('101:02:03.004 --> 101:02:04.000\nДолго')).toEqual([{ start: 363723.004, end: 363724, text: 'Долго' }])
		expect(parseSubtitles('')).toEqual([])
	})
})

describe('cueLines', () => {
	it('курсив, жирный, подчёркивание; остальные теги и теги ASS убираются; сущности раскодируются', () => {
		expect(cueLines('<v Ведущий>Привет, <i>мир</i> &amp; <B><u>все</u></B></v>')).toEqual([
			[
				{ text: 'Привет, ', isItalic: false, isBold: false, isUnderline: false },
				{ text: 'мир', isItalic: true, isBold: false, isUnderline: false },
				{ text: ' & ', isItalic: false, isBold: false, isUnderline: false },
				{ text: 'все', isItalic: false, isBold: true, isUnderline: true },
			],
		])
		expect(cueLines('{\\an8}<i.loud>A&nbsp;B</i> &lt;3&gt;')).toEqual([
			[
				{ text: `A${NBSP}B`, isItalic: true, isBold: false, isUnderline: false },
				{ text: ' <3>', isItalic: false, isBold: false, isUnderline: false },
			],
		])
	})

	it('пустые строки и строки только из тегов пропускаются', () => {
		expect(cueLines('Раз\n\n<i></i>\n  \nДва').map(line => line.map(segment => segment.text).join(''))).toEqual(['Раз', 'Два'])
		expect(cueLines('')).toEqual([])
	})
})

describe('activeCueText', () => {
	const cues = [
		{ start: 0, end: 2, text: 'A' },
		{ start: 1, end: 3, text: 'B' },
	]

	it('реплики, которые идут сейчас: начало включительно, конец — нет', () => {
		expect(activeCueText(cues, 0)).toBe('A')
		expect(activeCueText(cues, 1.5)).toBe('A\nB')
		expect(activeCueText(cues, 2)).toBe('B')
		expect(activeCueText(cues, 3)).toBe('')
	})
})

describe('decodeSubtitles', () => {
	it('UTF-8 с BOM и без', () => {
		expect(decodeSubtitles(new TextEncoder().encode('Привет').buffer)).toBe('Привет')
		expect(decodeSubtitles(bytes(0xef, 0xbb, 0xbf, 0x41))).toBe('A')
	})

	it('UTF-16 по метке порядка байтов', () => {
		expect(decodeSubtitles(bytes(0xff, 0xfe, 0x1f, 0x04, 0x38, 0x04))).toBe('Пи')
		expect(decodeSubtitles(bytes(0xfe, 0xff, 0x04, 0x1f, 0x04, 0x38))).toBe('Пи')
	})

	it('Windows-1251, если текст не читается как UTF-8', () => {
		expect(decodeSubtitles(bytes(0xcf, 0xf0, 0xe8, 0xe2, 0xe5, 0xf2))).toBe('Привет')
	})
})

describe('isSubtitleFile и captionPreset', () => {
	it.each([
		['serial-01.srt', true],
		['EPISODE.VTT', true],
		['anime.ass', false],
		['srt', false],
	])('%s → %s', (name, expected) => {
		expect(isSubtitleFile(name)).toBe(expected)
	})

	it('готовое положение или null после перетаскивания', () => {
		expect(captionPreset({ x: 50, y: 86 })).toBe('bottom')
		expect(captionPreset({ x: 50, y: 12 })).toBe('top')
		expect(captionPreset({ x: 40, y: 86 })).toBeNull()
	})
})
