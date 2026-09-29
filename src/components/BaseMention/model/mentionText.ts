import type { MentionOption, MentionQuery } from '../types/BaseMention.types'

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalize = (text: string): string => text.toLocaleLowerCase().replace(/ё/g, 'е')

export function findMentionQuery(text: string, caret: number, trigger: string): MentionQuery | null {
	const match = new RegExp(`(?:^|\\s)${escapeRegExp(trigger)}([\\p{L}\\p{N}_.-]*)$`, 'u').exec(text.slice(0, caret))
	if (!match) return null
	const query = match[1]
	return { query, start: caret - query.length - trigger.length, end: caret }
}

export function filterMentionOptions(options: readonly MentionOption[], query: string, limit: number): MentionOption[] {
	const needle = normalize(query)
	return options.filter(option => normalize(option.label).includes(needle) || normalize(option.value).includes(needle)).slice(0, limit)
}

export function insertMention(text: string, mention: MentionQuery, insertion: string): { text: string; caret: number } {
	const after = text.slice(mention.end)
	const spacer = after.startsWith(' ') ? '' : ' '
	const inserted = `${insertion}${spacer}`
	return { text: `${text.slice(0, mention.start)}${inserted}${after}`, caret: mention.start + inserted.length + (spacer ? 0 : 1) }
}
