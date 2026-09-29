import { decodeSubtitles, formatSubtitleTime, parseSubtitles, serializeSubtitles } from '../subtitleUtils'

const BOM = String.fromCharCode(0xfeff)

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

describe('formatSubtitleTime и serializeSubtitles', () => {
	it('время с часами и миллисекундами; отрицательное — ноль', () => {
		expect(formatSubtitleTime(3725.5)).toBe('01:02:05.500')
		expect(formatSubtitleTime(1.25, 'srt')).toBe('00:00:01,250')
		expect(formatSubtitleTime(-3)).toBe('00:00:00.000')
	})

	it('vtt с заголовком, srt с номерами; реплики по началу; разбор записанного даёт те же реплики', () => {
		const cues = [
			{ start: 5, end: 7.5, text: 'Вторая\nстрока' },
			{ start: 1, end: 3, text: 'Первая' },
		]
		const vtt = serializeSubtitles(cues)
		const srt = serializeSubtitles(cues, 'srt')
		expect(vtt).toBe('WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nПервая\n\n00:00:05.000 --> 00:00:07.500\nВторая\nстрока\n')
		expect(srt).toBe('1\n00:00:01,000 --> 00:00:03,000\nПервая\n\n2\n00:00:05,000 --> 00:00:07,500\nВторая\nстрока\n')
		expect(parseSubtitles(vtt)).toEqual([...cues].reverse())
		expect(parseSubtitles(srt)).toEqual([...cues].reverse())
		expect(serializeSubtitles([])).toBe('WEBVTT\n\n\n')
	})
})
