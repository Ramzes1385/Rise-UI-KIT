import { BOTTOM_NAV_SLIDING_VARIANTS } from '../types/BaseBottomNav.types'
import type { BottomNavItem, BottomNavVariant } from '../types/BaseBottomNav.types'

export function getPrimaryIndex(items: BottomNavItem[], variant: BottomNavVariant | undefined): number {
	if (variant !== 'notched') return -1
	return items.findIndex(item => item.isPrimary)
}

export function getIndicatorStyle(
	variant: BottomNavVariant | undefined,
	activeIndex: number,
	count: number,
): Record<string, string> | null {
	if (!variant || !BOTTOM_NAV_SLIDING_VARIANTS.includes(variant) || activeIndex < 0) return null
	return {
		width: `calc((100% - 2 * var(--bottom-nav-bar-padding)) / ${count})`,
		transform: `translateX(calc(${activeIndex} * 100% * var(--bottom-nav-direction)))`,
	}
}

export function getNotchStyle(primaryIndex: number, count: number): Record<string, string> | undefined {
	if (primaryIndex < 0) return undefined
	return { '--bottom-nav-notch-x': `${((primaryIndex + 0.5) / count) * 100}%` }
}
