import { watch } from 'vue'
import type { Ref } from 'vue'
import type { MediaHotkeysOptions } from '../types/MediaCore.types'

const TEXT_INPUT_SELECTOR = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]'
const ACTIVATES_ON_SPACE_SELECTOR = 'button, a[href], [role="button"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]'

function digitFraction(code: string): number | null {
	const match = /^(?:Digit|Numpad)(\d)$/.exec(code)
	return match ? Number(match[1]) / 10 : null
}

function hotkeyMap(options: MediaHotkeysOptions): Map<string, () => void> {
	const { actions } = options
	return new Map<string, () => void>([
		['Space', actions.togglePlay],
		['KeyK', actions.togglePlay],
		['ArrowLeft', () => actions.seekBy(-options.seekStep())],
		['ArrowRight', () => actions.seekBy(options.seekStep())],
		['KeyJ', () => actions.seekBy(-options.seekStepLarge())],
		['KeyL', () => actions.seekBy(options.seekStepLarge())],
		['PageDown', () => actions.seekBy(-options.seekStepLarge())],
		['PageUp', () => actions.seekBy(options.seekStepLarge())],
		['Home', () => actions.seekToFraction(0)],
		['End', () => actions.seekToFraction(1)],
		['ArrowUp', () => actions.changeVolume(options.volumeStep())],
		['ArrowDown', () => actions.changeVolume(-options.volumeStep())],
		['KeyM', actions.toggleMute],
		['KeyF', actions.toggleFullscreen],
		['Shift+Comma', () => actions.stepPlaybackRate(-1)],
		['Shift+Period', () => actions.stepPlaybackRate(1)],
	])
}

function isIgnored(event: KeyboardEvent): boolean {
	const target = event.target as Element
	if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return true
	if (target.closest(TEXT_INPUT_SELECTOR)) return true
	return event.code === 'Space' && Boolean(target.closest(ACTIVATES_ON_SPACE_SELECTOR))
}

export function useMediaHotkeys(target: Readonly<Ref<HTMLElement | null>>, options: MediaHotkeysOptions): void {
	const hotkeys = hotkeyMap(options)
	const onKeydown = (event: KeyboardEvent): void => {
		if (!options.isEnabled() || isIgnored(event)) return
		const fraction = digitFraction(event.code)
		const handler =
			fraction === null
				? hotkeys.get(event.shiftKey ? `Shift+${event.code}` : event.code)
				: () => options.actions.seekToFraction(fraction)
		if (!handler) return
		event.preventDefault()
		handler()
	}
	watch(
		target,
		(element, _, onCleanup) => {
			if (!element) return
			element.addEventListener('keydown', onKeydown)
			onCleanup(() => element.removeEventListener('keydown', onKeydown))
		},
		{ immediate: true },
	)
}
