import type { MaybeRefOrGetter } from 'vue'
/** Composable: горячие клавиши на странице с учётом платформы и раскладки */
import { onScopeDispose, toValue, watch } from 'vue'
import type { HotkeyMap, ParsedHotkey, UseHotkeysOptions } from './types/useHotkeys.types'

const KEY_ALIASES: Record<string, string> = {
	esc: 'escape',
	space: ' ',
	plus: '+',
	up: 'arrowup',
	down: 'arrowdown',
	left: 'arrowleft',
	right: 'arrowright',
}

export function isMacPlatform(): boolean {
	return typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)
}

/** Разбирает сочетание `mod+shift+k`: `mod` — ⌘ на macOS и Ctrl на остальных системах */
export function parseHotkey(hotkey: string, isMac = isMacPlatform()): ParsedHotkey {
	const parts = hotkey
		.toLowerCase()
		.split(/\+(?!$)/)
		.map(part => part.trim())
	const key = parts.pop() as string
	const has = (name: string): boolean => parts.includes(name)
	return {
		key: KEY_ALIASES[key] ?? key,
		ctrl: has('ctrl') || (!isMac && has('mod')),
		meta: has('meta') || has('cmd') || (isMac && has('mod')),
		shift: has('shift'),
		alt: has('alt') || has('option'),
	}
}

function isSameKey(event: KeyboardEvent, key: string): boolean {
	if (/^[a-z]$/.test(key)) return event.code === `Key${key.toUpperCase()}`
	if (/^\d$/.test(key)) return event.code === `Digit${key}`
	return event.key.toLowerCase() === key
}

/** Совпадает ли нажатие с сочетанием: клавиша и ровно те же модификаторы */
export function matchesHotkey(event: KeyboardEvent, hotkey: string | ParsedHotkey, isMac = isMacPlatform()): boolean {
	const parsed = typeof hotkey === 'string' ? parseHotkey(hotkey, isMac) : hotkey
	const isShiftFree = !parsed.shift && !/^[a-z\d]$/.test(parsed.key) && event.key.length === 1
	return (
		isSameKey(event, parsed.key) &&
		event.ctrlKey === parsed.ctrl &&
		event.metaKey === parsed.meta &&
		event.altKey === parsed.alt &&
		(isShiftFree || event.shiftKey === parsed.shift)
	)
}

const isField = (target: EventTarget | null): boolean =>
	target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

const hasModifier = (hotkey: ParsedHotkey): boolean => hotkey.ctrl || hotkey.meta || hotkey.alt

function findHotkey(event: KeyboardEvent, bindings: HotkeyMap): { hotkey: ParsedHotkey; handler: HotkeyMap[string] } | undefined {
	for (const [text, handler] of Object.entries(bindings)) {
		const hotkey = parseHotkey(text)
		if (matchesHotkey(event, hotkey)) return { hotkey, handler }
	}
	return undefined
}

const isSkipped = (event: KeyboardEvent, options: UseHotkeysOptions): boolean =>
	event.defaultPrevented || event.isComposing || !toValue(options.isEnabled ?? true)

/**
 * Горячие клавиши: `useHotkeys({ 'mod+k': openPalette, '?': showHelp })`. Слушатель снимается вместе с областью
 * эффекта (компонентом). Нажатие, уже обработанное другим кодом (`defaultPrevented`), и набор через IME пропускаются
 */
export function useHotkeys(bindings: MaybeRefOrGetter<HotkeyMap>, options: UseHotkeysOptions = {}): void {
	const handleKeydown = (event: Event): void => {
		const keyboard = event as KeyboardEvent
		const found = isSkipped(keyboard, options) ? undefined : findHotkey(keyboard, toValue(bindings))
		if (!found || (isField(keyboard.target) && !hasModifier(found.hotkey) && !options.isAllowedInFields)) return
		keyboard.preventDefault()
		found.handler(keyboard)
	}
	const resolveTarget = (): EventTarget | null | undefined => {
		if (options.target !== undefined) return toValue(options.target)
		return typeof window === 'undefined' ? null : window
	}
	const stop = watch(
		resolveTarget,
		(target, _, onCleanup) => {
			target?.addEventListener('keydown', handleKeydown)
			onCleanup(() => target?.removeEventListener('keydown', handleKeydown))
		},
		{ immediate: true },
	)
	onScopeDispose(stop)
}
