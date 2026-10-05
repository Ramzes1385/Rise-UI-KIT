import { BOTTOM_NAV_SLIDING_VARIANTS } from '../types/BaseBottomNav.types'
import type { BottomNavEntry, BottomNavItem, BottomNavVariant } from '../types/BaseBottomNav.types'

export function getPrimaryIndex(items: BottomNavItem[], variant: BottomNavVariant | undefined): number {
	if (variant !== 'notched') return -1
	return items.findIndex(item => item.isPrimary)
}

export function isCellIndicator(variant: BottomNavVariant | undefined): boolean {
	return variant !== undefined && BOTTOM_NAV_SLIDING_VARIANTS.includes(variant)
}

export function getIndicatorIndex(entries: BottomNavEntry[], isCell: boolean): number {
	const index = entries.findIndex(entry => entry.isActive)
	const entry = entries[index]
	if (!entry || entry.isPrimary) return -1
	return entry.item.isDisabled && !isCell ? -1 : index
}

export function getNotchStyle(primaryIndex: number, count: number): Record<string, string> | undefined {
	if (primaryIndex < 0) return undefined
	return { '--bottom-nav-notch-x': `${((primaryIndex + 0.5) / count) * 100}%` }
}
