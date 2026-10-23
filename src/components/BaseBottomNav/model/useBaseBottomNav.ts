import { warn } from '@/locales/warn'
import { pluralize } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import { useMotion } from '@composables/app/useMotion'
import { calcIconScale } from '@utils/media/iconUtils'
import { UI_ARIA, UI_PLURAL, UI_WARNINGS } from '@/locales/messages'
import type { ResolvedLink } from '@composables/interaction/useLink'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { resolveLink, useLinkComponent } from '@composables/interaction/useLink'
import { useSlidingIndicator } from '@composables/interaction/useSlidingIndicator'
import { getIndicatorIndex, getNotchStyle, getPrimaryIndex, isCellIndicator } from './bottomNavLayout'
import type { BaseBottomNavEmits, BottomNavEntry, BottomNavItem, BottomNavProps } from '../types/BaseBottomNav.types'
import { BOTTOM_NAV_MAX_ITEMS, BOTTOM_NAV_MIN_ITEMS, BOTTOM_NAV_SCROLL_THRESHOLD } from '../types/BaseBottomNav.types'

const BOTTOM_NAV_ELEMENTS = ['root', 'bar', 'list', 'item', 'link', 'icon', 'label', 'badge']

function useItemCountWarning(props: BottomNavProps): void {
	watch(
		() => props.items.length,
		count => {
			if (count >= BOTTOM_NAV_MIN_ITEMS && count <= BOTTOM_NAV_MAX_ITEMS) return
			warn(UI_WARNINGS.BOTTOM_NAV_ITEM_COUNT, { count, min: BOTTOM_NAV_MIN_ITEMS, max: BOTTOM_NAV_MAX_ITEMS })
		},
		{ immediate: true },
	)
}

function useScrollHiding(props: BottomNavProps) {
	const isHidden = ref(false)
	const hasFocusWithin = ref(false)
	let lastY = 0

	const onScroll = (): void => {
		const delta = window.scrollY - lastY
		if (Math.abs(delta) < BOTTOM_NAV_SCROLL_THRESHOLD) return
		lastY = window.scrollY
		isHidden.value = delta > 0 && !hasFocusWithin.value
	}
	const stop = (): void => {
		window.removeEventListener('scroll', onScroll)
		isHidden.value = false
	}
	const sync = (isOn: boolean): void => {
		stop()
		if (!isOn) return
		lastY = window.scrollY
		window.addEventListener('scroll', onScroll, { passive: true })
	}

	onMounted(() => sync(props.hideOnScroll))
	watch(() => props.hideOnScroll, sync)
	onBeforeUnmount(stop)

	return {
		isHidden,
		handleFocusIn(): void {
			hasFocusWithin.value = true
			isHidden.value = false
		},
		handleFocusOut(event: FocusEvent): void {
			const root = event.currentTarget as HTMLElement
			if (!root.contains(event.relatedTarget as Node | null)) hasFocusWithin.value = false
		},
	}
}

function badgeOf(item: BottomNavItem, maxBadge: number): BottomNavEntry['badge'] {
	const { badge } = item
	if (typeof badge === 'number') {
		if (badge <= 0) return null
		const label = item.badgeLabel ?? pluralize(UI_PLURAL.NOTIFICATIONS_UNREAD, badge)
		return { text: badge > maxBadge ? `${maxBadge}+` : String(badge), label }
	}
	if (!badge) return null
	return { text: badge, label: item.badgeLabel ?? badge }
}

function isNewTabClick(event: MouseEvent, item: BottomNavItem): boolean {
	return item.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey
}

function useEntries(props: BottomNavProps, current: () => string | null) {
	const appLinkComponent = useLinkComponent()
	const ownId = useId()

	const getLink = (item: BottomNavItem): ResolvedLink => {
		if (item.to === undefined && item.href === undefined) {
			return { is: 'button', attrs: { type: 'button', disabled: item.isDisabled || undefined }, hasTarget: false }
		}
		const options = { to: item.to, href: item.href, target: item.target, isDisabled: item.isDisabled }
		return resolveLink(options, props.linkComponent ?? appLinkComponent)
	}

	return computed<BottomNavEntry[]>(() => {
		const primaryIndex = getPrimaryIndex(props.items, props.variant)
		return props.items.map((item, index) => {
			const isActive = item.value === current()
			return {
				item,
				badgeId: `${ownId}-badge-${index}`,
				link: getLink(item),
				isActive,
				isPrimary: index === primaryIndex,
				icon: isActive && item.activeIcon ? item.activeIcon : item.icon,
				badge: badgeOf(item, props.maxBadge),
			}
		})
	})
}

function useBarLayout(props: BottomNavProps, entries: () => BottomNavEntry[]) {
	const barRef = ref<HTMLElement | null>(null)
	const isCell = computed(() => isCellIndicator(props.variant))
	const indicator = useSlidingIndicator(barRef, () => getIndicatorIndex(entries(), isCell.value))
	const motion = useMotion(barRef)
	watch(() => props.variant, indicator.update, { flush: 'post' })

	return {
		barRef,
		isCellIndicator: isCell,
		indicatorStyle: indicator.style,
		isIndicatorVisible: indicator.isVisible,
		isIndicatorInstant: computed(() => indicator.isInstant.value || motion.isReduced.value),
		notchStyle: computed(() => getNotchStyle(getPrimaryIndex(props.items, props.variant), props.items.length)),
	}
}

export function useBaseBottomNav(props: BottomNavProps, emit: BaseBottomNavEmits) {
	const current = ref<string | null>(props.modelValue ?? null)
	watch(
		() => props.modelValue,
		value => {
			current.value = value ?? null
		},
	)
	useItemCountWarning(props)
	const entries = useEntries(props, () => current.value)

	return {
		...useStandardBaseComponent('base-bottom-nav', props, BOTTOM_NAV_ELEMENTS),
		ui: useUi(props, 'base-bottom-nav'),
		...useScrollHiding(props),
		entries,
		...useBarLayout(props, () => entries.value),
		navLabel: computed(() => props.ariaLabel ?? UI_ARIA.BOTTOM_NAV),
		iconScale: computed(() => calcIconScale('lg', props.sizeScale)),
		badgeScale: computed(() => calcIconScale('sm', props.sizeScale)),
		handleItemClick(entry: BottomNavEntry, event: MouseEvent): void {
			const { item, link } = entry
			if (item.isDisabled) return event.preventDefault()
			if (link.hasTarget) emit('navigate', (item.href ?? item.to)!)
			if (link.hasTarget && isNewTabClick(event, item)) return
			current.value = item.value
			emit('update:modelValue', item.value)
			emit('select', item)
		},
	}
}
