import { computed, shallowRef, watch } from 'vue'
import { toDayKey } from '@utils/calendar/eventUtils'
import { useMotion } from '@composables/app/useMotion'
import type { EventCalendarContext, EventCalendarViewMotion } from '../../types/BaseEventCalendarModel.types'

const LEAVING_CLASS = 'base-event-calendar__view-leaving'

const FOCUS_ATTRIBUTES = ['data-event-key', 'data-day', 'data-column']

function isHiddenAttribute(name: string): boolean {
	return name === 'id' || name === 'tabindex' || name.startsWith('data-')
}

function focusSelector(element: Element): string | null {
	const active = element.ownerDocument.activeElement
	if (!active || !element.contains(active)) return null
	const attribute = FOCUS_ATTRIBUTES.find(name => active.hasAttribute(name))
	return attribute ? `[${attribute}="${active.getAttribute(attribute)!.replace(/"/g, '\\"')}"]` : '[tabindex="0"]'
}

function hideLeaving(element: Element): void {
	for (const node of [element, ...element.querySelectorAll('*')]) {
		node.getAttributeNames()
			.filter(isHiddenAttribute)
			.forEach(name => node.removeAttribute(name))
	}
	element.setAttribute('aria-hidden', 'true')
	element.setAttribute('inert', '')
	element.classList.add(LEAVING_CLASS)
}

export function useEventCalendarMotion(context: EventCalendarContext) {
	const { view, period } = context
	const motion = useMotion(context.rootRef)
	const kind = shallowRef<EventCalendarViewMotion>('change')
	let focus: string | null = null
	watch(
		[view, () => period.value.start.getTime()],
		([nextView, start], [lastView, lastStart]) => {
			if (nextView !== lastView) kind.value = 'change'
			else kind.value = start > lastStart ? 'next' : 'prev'
		},
		{ flush: 'sync' },
	)
	function handleViewLeave(element: Element): void {
		focus = focusSelector(element)
		hideLeaving(element)
	}
	function handleViewEnter(element: Element): void {
		const selector = focus?.startsWith('[data-day=') ? `[data-day="${toDayKey(context.date.value)}"]` : focus
		if (selector) element.querySelector<HTMLElement>(selector)?.focus()
		focus = null
	}
	return {
		viewKey: computed(() => `${view.value}:${period.value.start.getTime()}`),
		viewTransition: computed(() => ({
			name: `base-event-calendar__view-${kind.value}`,
			css: !motion.isReduced.value,
			onBeforeLeave: handleViewLeave,
			onEnter: handleViewEnter,
		})),
	}
}
