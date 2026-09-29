import type { EmojiPickerItem } from '../types/BaseEmojiPicker.types'

export const RECENT_SAMPLE = ['👍', '🎉', '❤️', '😂', '🔥', '👀']

export const REACTIONS: EmojiPickerItem[] = [
	{ emoji: '👍', label: 'нравится', category: 'people' },
	{ emoji: '👎', label: 'не нравится', category: 'people' },
	{ emoji: '😂', label: 'смешно', category: 'smileys' },
	{ emoji: '😮', label: 'удивительно', category: 'smileys' },
	{ emoji: '😢', label: 'грустно', category: 'smileys' },
	{ emoji: '❤️', label: 'люблю', category: 'symbols' },
	{ emoji: '🔥', label: 'огонь', category: 'travel' },
	{ emoji: '🎉', label: 'праздник', category: 'activities' },
]
