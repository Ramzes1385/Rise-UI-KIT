import { activeCueText, captionPreset, cueLines, isSubtitleFile } from '../model/subtitles'

const NBSP = String.fromCharCode(0xa0)

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
