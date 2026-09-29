import { computed } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { KbdKeyLabel, KbdKeySpec, KbdProps } from '../types/BaseKbd.types'

const MAC_MODIFIERS = new Map<string, KbdKeySpec>([
	['meta', ['⌘', 'KEY_COMMAND']],
	['ctrl', ['⌃', 'KEY_CONTROL']],
	['control', ['⌃', 'KEY_CONTROL']],
	['alt', ['⌥', 'KEY_OPTION']],
	['option', ['⌥', 'KEY_OPTION']],
])
const MODIFIERS = new Map([
	['meta', 'Ctrl'],
	['ctrl', 'Ctrl'],
	['control', 'Ctrl'],
	['alt', 'Alt'],
	['option', 'Alt'],
])
const KEYS = new Map<string, KbdKeySpec>([
	['shift', ['⇧', 'KEY_SHIFT']],
	['enter', ['↵', 'KEY_ENTER']],
	['backspace', ['⌫', 'KEY_BACKSPACE']],
	['delete', ['⌦', 'KEY_DELETE']],
	['arrowup', ['↑', 'KEY_UP']],
	['arrowdown', ['↓', 'KEY_DOWN']],
	['arrowleft', ['←', 'KEY_LEFT']],
	['arrowright', ['→', 'KEY_RIGHT']],
	['escape', ['Esc']],
	['tab', ['Tab']],
	['space', ['Space']],
])

function detectMac(): boolean {
	if (typeof navigator === 'undefined') return false
	return /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)
}

function resolveKey(value: string, isMac: boolean): KbdKeyLabel {
	const name = value.toLowerCase()
	const spec = (isMac && MAC_MODIFIERS.get(name)) || KEYS.get(name)
	if (!spec) return { text: MODIFIERS.get(name) ?? value }
	const [text, aria] = spec
	return aria ? { text, name: UI_ARIA[aria] } : { text }
}

export function useBaseKbd(props: KbdProps) {
	const isMac = computed(() => (props.platform ? props.platform === 'mac' : detectMac()))

	return {
		...useStandardBaseComponent('base-kbd', props, ['root']),
		key: computed(() => resolveKey(props.value, isMac.value)),
	}
}
