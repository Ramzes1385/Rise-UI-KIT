/**
 * Константы чата.
 * Группированы в объект UI_CHAT для удобного доступа.
 */

import { localized } from './localized'

/** Масштабные коэффициенты чата */
export const UI_CHAT_SCALE = {
	ICON: 0.75,
	META: 0.7,
	MEMBER: 0.9,
	SUBTEXT: 0.65,
	AVATAR_LARGE: 1.5,
	NAME: 1.1,
	FILE_ICON: 1.2,
	CONFIRM: 0.95,
	STATUS: 0.6,
	SPINNER: 0.5,
} as const

export const UI_CHAT_TEXT = localized('chat')
