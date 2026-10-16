import { normalizeText } from './filterUtils'
import { foldSearchText } from '@utils/data/textUtils'
import type { SectionsInput } from '../../types/internal/imageMapInternal.types'
import type { ImageMapDirectoryEntry, ImageMapDirectorySection } from '../../types/internal/ImageMapDirectory.types'

function byGroup(input: SectionsInput): ImageMapDirectorySection[] {
	const sections = input.groups.map(group => ({ id: group.id, title: group.title, entries: [] as ImageMapDirectoryEntry[] }))
	const other: ImageMapDirectorySection = { id: '', title: input.otherTitle, entries: [] }
	for (const entry of input.entries) {
		const section = sections.find(item => item.id === entry.item.group?.id) ?? other
		section.entries.push(entry)
	}
	return [...sections, other].filter(section => section.entries.length > 0)
}

const OTHER_LETTER = '#'
const LATIN_LETTER = /^\p{Script=Latin}$/u

const KANA_ROWS = [
	'ぁあぃいぅうぇえぉおゔ',
	'かがきぎくぐけげこごゕゖ',
	'さざしじすずせぜそぞ',
	'ただちぢっつづてでとど',
	'なにぬねの',
	'はばぱひびぴふぶぷへべぺほぼぽ',
	'まみむめも',
	'ゃやゅゆょよ',
	'らりるれろ',
	'ゎわゐゑをん',
]
const KANA_ROW_HEADS = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ']
const KANA_ROW_OF = new Map(KANA_ROWS.flatMap((row, index) => [...row].map(char => [char, KANA_ROW_HEADS[index]] as const)))

function languageOf(locale: string): string {
	return locale.split('-')[0].toLowerCase()
}

function japaneseLetter(title: string, locale: string): string {
	const first = [...normalizeText(title)][0]
	if (!first) return OTHER_LETTER
	const row = KANA_ROW_OF.get(foldSearchText(first, locale))
	if (row) return row
	return LATIN_LETTER.test(first) ? first.toLocaleUpperCase(locale) : OTHER_LETTER
}

function sectionLetter(title: string, locale: string): string {
	if (languageOf(locale) === 'ja') return japaneseLetter(title, locale)
	return [...normalizeText(title)][0]?.toLocaleUpperCase(locale) || OTHER_LETTER
}

const LANGUAGES_WITHOUT_LETTERS = new Set(['zh'])

function byLetter(entries: ImageMapDirectoryEntry[], locale: string): ImageMapDirectorySection[] {
	const sections = new Map<string, ImageMapDirectorySection>()
	for (const entry of entries) {
		const letter = sectionLetter(entry.item.object.title, locale)
		const section = sections.get(letter) ?? { id: letter, title: letter, entries: [] }
		section.entries.push(entry)
		sections.set(letter, section)
	}
	const ordered = [...sections.values()]
	return languageOf(locale) === 'ja'
		? [...ordered.filter(section => section.id !== OTHER_LETTER), ...ordered.filter(section => section.id === OTHER_LETTER)]
		: ordered
}

function single(entries: ImageMapDirectoryEntry[]): ImageMapDirectorySection[] {
	return entries.length ? [{ id: 'all', title: '', entries }] : []
}

export function directorySections(input: SectionsInput): ImageMapDirectorySection[] {
	const collator = new Intl.Collator(input.locale, { numeric: true, sensitivity: 'base' })
	const sorted = [...input.entries].sort((a, b) => collator.compare(a.item.object.title, b.item.object.title))
	if (input.groupBy === 'group') return byGroup({ ...input, entries: sorted })
	if (input.groupBy === 'alpha' && !LANGUAGES_WITHOUT_LETTERS.has(languageOf(input.locale))) return byLetter(sorted, input.locale)
	return single(sorted)
}
