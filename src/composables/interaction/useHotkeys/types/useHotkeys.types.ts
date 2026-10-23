import type { MaybeRefOrGetter } from 'vue'

/** Обработчик сочетания клавиш */
export type HotkeyHandler = (event: KeyboardEvent) => void

/**
 * Сочетания и обработчики: `'mod+k'`, `'ctrl+shift+p'`, `'escape'`, `'?'`. `mod` — ⌘ на macOS и Ctrl на остальных
 * системах; буквы и цифры сравниваются по физической клавише, поэтому `mod+k` срабатывает и в русской раскладке
 */
export type HotkeyMap = Record<string, HotkeyHandler>

/** Разобранное сочетание: клавиша и модификаторы */
export interface ParsedHotkey {
	key: string
	ctrl: boolean
	meta: boolean
	shift: boolean
	alt: boolean
}

/** Настройки useHotkeys */
export interface UseHotkeysOptions {
	/** Где слушать клавиши; по умолчанию — window */
	target?: MaybeRefOrGetter<EventTarget | null | undefined>
	/** Сочетания работают, пока здесь true */
	isEnabled?: MaybeRefOrGetter<boolean>
	/**
	 * Срабатывать и в полях ввода. По умолчанию в полях срабатывают только сочетания с Ctrl, ⌘ или Alt, чтобы
	 * одиночные клавиши («?», «/») не мешали печатать
	 */
	isAllowedInFields?: boolean
}
