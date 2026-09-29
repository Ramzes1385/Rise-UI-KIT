import { UI_EMOJI } from '@/locales/messages'
import { EMOJI_CATEGORIES } from '../types/BaseEmojiPicker.types'
import type { EmojiCategory, EmojiPickerItem, EmojiPickerSection } from '../types/BaseEmojiPicker.types'

const LOADERS = {
	ru: () => import('./data/emojiRu'),
	en: () => import('./data/emojiEn'),
}

const SECTION_META = {
	recent: { key: 'RECENT', icon: '🕘' },
	results: { key: 'SEARCH', icon: '🔍' },
	smileys: { key: 'SMILEYS', icon: '😀' },
	people: { key: 'PEOPLE', icon: '👋' },
	nature: { key: 'NATURE', icon: '🐻' },
	food: { key: 'FOOD', icon: '🍔' },
	travel: { key: 'TRAVEL', icon: '✈️' },
	activities: { key: 'ACTIVITIES', icon: '⚽' },
	objects: { key: 'OBJECTS', icon: '💡' },
	symbols: { key: 'SYMBOLS', icon: '❤️' },
} as const

const cache = new Map<string, Promise<EmojiPickerItem[]>>()

export function parseEmojiData(source: string): EmojiPickerItem[] {
	return source.split('|').map(record => {
		const space = record.indexOf(' ')
		return { category: EMOJI_CATEGORIES[Number(record[0])], emoji: record.slice(1, space), label: record.slice(space + 1) }
	})
}

export function loadEmojiData(locale: string): Promise<EmojiPickerItem[]> {
	const key = locale === 'ru' ? 'ru' : 'en'
	const cached = cache.get(key)
	if (cached) return cached
	const loading = LOADERS[key]().then(module => parseEmojiData(module.default))
	cache.set(key, loading)
	return loading
}

const normalizeQuery = (text: string): string => text.trim().toLocaleLowerCase().replace(/ё/g, 'е')

export const emojiKey = (emoji: string): string => emoji.replace(/\uFE0F/g, '')

export function searchEmojis(items: readonly EmojiPickerItem[], query: string): EmojiPickerItem[] {
	const needle = normalizeQuery(query)
	const key = emojiKey(query.trim())
	return items.filter(item => emojiKey(item.emoji) === key || normalizeQuery(item.label).includes(needle))
}

function section(id: EmojiPickerSection['id'], items: EmojiPickerItem[]): Omit<EmojiPickerSection, 'offset'> {
	return { id, items, label: UI_EMOJI[SECTION_META[id].key], icon: SECTION_META[id].icon }
}

function withOffsets(sections: Omit<EmojiPickerSection, 'offset'>[]): EmojiPickerSection[] {
	let offset = 0
	return sections
		.filter(entry => entry.items.length > 0)
		.map(entry => {
			const result = { ...entry, offset }
			offset += entry.items.length
			return result
		})
}

const byCategory = (items: readonly EmojiPickerItem[], id: EmojiCategory): EmojiPickerItem[] => items.filter(item => item.category === id)

export function buildSections(items: readonly EmojiPickerItem[], recent: readonly string[], query: string): EmojiPickerSection[] {
	if (query.trim()) return withOffsets([section('results', searchEmojis(items, query))])
	const byEmoji = new Map(items.map(item => [emojiKey(item.emoji), item]))
	const recentItems = recent.flatMap(emoji => byEmoji.get(emojiKey(emoji)) ?? [])
	return withOffsets([section('recent', recentItems), ...EMOJI_CATEGORIES.map(id => section(id, byCategory(items, id)))])
}
