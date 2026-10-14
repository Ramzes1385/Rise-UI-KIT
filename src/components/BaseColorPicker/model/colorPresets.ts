import { UI_COLOR_PICKER } from '@/locales/messages'
import type { ColorPalette } from '../types/BaseColorPicker.types'

const TOKEN_NAME = /^var\(\s*--(?:rise-)?([\w-]+)/

export const DEFAULT_COLOR_PRESETS = [
	'#f97316',
	'#ef4444',
	'#f59e0b',
	'#22c55e',
	'#06b6d4',
	'#3b82f6',
	'#a855f7',
	'#ec4899',
	'#ffffff',
	'#9ca3af',
	'#4b5563',
	'#000000',
] as const

const KIT_COLOR_TOKENS = [
	'var(--rise-primary)',
	'var(--rise-success)',
	'var(--rise-info)',
	'var(--rise-warning)',
	'var(--rise-error)',
	'var(--rise-text)',
	'var(--rise-border-accented)',
	'var(--rise-bg-accented)',
] as const

export function getKitTokenPalette(): ColorPalette {
	return { label: UI_COLOR_PICKER.TOKENS, colors: KIT_COLOR_TOKENS }
}

export function swatchName(color: string): string {
	return TOKEN_NAME.exec(color.trim())?.[1] ?? color
}
