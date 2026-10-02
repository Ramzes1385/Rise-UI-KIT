import { normalizeText } from './filterUtils'
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

function byLetter(entries: ImageMapDirectoryEntry[]): ImageMapDirectorySection[] {
	const sections = new Map<string, ImageMapDirectorySection>()
	for (const entry of entries) {
		const letter = normalizeText(entry.item.object.title).charAt(0).toLocaleUpperCase() || '#'
		const section = sections.get(letter) ?? { id: letter, title: letter, entries: [] }
		section.entries.push(entry)
		sections.set(letter, section)
	}
	return [...sections.values()]
}

export function directorySections(input: SectionsInput): ImageMapDirectorySection[] {
	const collator = new Intl.Collator(input.locale, { numeric: true, sensitivity: 'base' })
	const sorted = [...input.entries].sort((a, b) => collator.compare(a.item.object.title, b.item.object.title))
	if (input.groupBy === 'group') return byGroup({ ...input, entries: sorted })
	if (input.groupBy === 'alpha') return byLetter(sorted)
	return sorted.length ? [{ id: 'all', title: '', entries: sorted }] : []
}
