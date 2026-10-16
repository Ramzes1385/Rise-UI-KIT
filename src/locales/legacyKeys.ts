/** Прежние ключи-куски составных подписей: в словарях кита их нет, но заданные приложением через `defineLocale` они по-прежнему работают */
import type { LegacyMessage, LocaleSection, MessageMap } from './types/locales.types'

const LEGACY: Partial<Record<LocaleSection, Record<string, LegacyMessage>>> = {
	rating: {
		VALUE_OF_MAX: { requires: ['OF'], build: m => `{value} ${m.OF} {max}` },
		VALUE_LABEL: { requires: ['OF'], build: m => `${m.LABEL} {value} ${m.OF} {max}` },
		RANGE_LABEL: { requires: ['ARIA_PREFIX'], build: m => `${m.ARIA_PREFIX} {max}` },
	},
	text: {
		FILE_MAX_SIZE: {
			requires: ['FILE_MAX_SIZE_PREFIX', 'FILE_MAX_SIZE_SUFFIX'],
			build: m => `${m.FILE_MAX_SIZE_PREFIX} {size} ${m.FILE_MAX_SIZE_SUFFIX}`,
		},
	},
	chat: {
		TYPING: { requires: ['TYPING_SUFFIX'], build: m => `{name} ${m.TYPING_SUFFIX}` },
		PINNED_POSITION: { requires: ['PINNED_COUNTER'], build: m => `{index} ${m.PINNED_COUNTER} {total}` },
		SELECTED_COUNT: { requires: ['SELECTED_PREFIX'], build: m => `${m.SELECTED_PREFIX} {count}` },
		PROFILE_OF: { requires: ['PROFILE_ARIA'], build: m => `${m.PROFILE_ARIA} {name}` },
		ADD_REACTION_EMOJI: { requires: ['ADD_REACTION'], build: m => `${m.ADD_REACTION} {emoji}` },
		DOWNLOAD_IMAGE_NAMED: { requires: ['DOWNLOAD_IMAGE'], build: m => `${m.DOWNLOAD_IMAGE} {name}` },
		DOWNLOAD_FILE_NAMED: { requires: ['DOWNLOAD_FILE'], build: m => `${m.DOWNLOAD_FILE} {name}` },
		MEMBER_ACTIONS_NAMED: { requires: ['MEMBER_ACTIONS'], build: m => `${m.MEMBER_ACTIONS} {name}` },
		QUICK_REPLY_NAMED: { requires: ['QUICK_REPLY'], build: m => `${m.QUICK_REPLY} {reply}` },
		REMOVE_ATTACHMENT_NAMED: { requires: ['REMOVE_ATTACHMENT'], build: m => `${m.REMOVE_ATTACHMENT} {name}` },
	},
}

/**
 * Шаблон нового ключа, собранный из прежних ключей-кусков, если приложение задало их в своём словаре;
 * `undefined` — прежних ключей нет, берётся строка словаря.
 */
export function legacyMessage(section: LocaleSection, key: string, messages: MessageMap): string | undefined {
	const entries = LEGACY[section]
	const entry = entries && Object.prototype.hasOwnProperty.call(entries, key) ? entries[key] : undefined
	return entry?.requires.every(name => messages[name] !== undefined) ? entry.build(messages) : undefined
}
