import { computed, watch } from 'vue'

const CHAT_MESSAGE_TRANSITION = 'base-chat-message'
const CHAT_MESSAGE_STATIC = 'base-chat-message-static'

function isAppended(previous: { ids: readonly string[]; query: string }, ids: readonly string[], query: string): boolean {
	if (query !== previous.query) return false
	const current = new Set(ids)
	const kept = previous.ids.filter(id => current.has(id))
	if (kept.length === 0) return false
	const known = new Set(previous.ids)
	const lastKept = ids.indexOf(kept[kept.length - 1])
	return ids.slice(0, lastKept).every(id => known.has(id))
}

function pinLeaving(el: Element): void {
	const item = el as HTMLElement
	item.style.top = `${item.offsetTop}px`
	item.style.left = `${item.offsetLeft}px`
	item.style.width = `${item.offsetWidth}px`
}

export function useChatMessageMotion(ids: () => readonly string[], query: () => string) {
	let previous = { ids: [] as readonly string[], query: '' }
	const currentIds = computed(ids)
	const enterName = computed(() => (isAppended(previous, currentIds.value, query()) ? CHAT_MESSAGE_TRANSITION : CHAT_MESSAGE_STATIC))
	watch(
		[currentIds, query],
		([nextIds, nextQuery]) => {
			previous = { ids: nextIds, query: nextQuery }
		},
		{ flush: 'post', immediate: true },
	)

	return {
		enterName,
		isAppending: () => enterName.value === CHAT_MESSAGE_TRANSITION,
		handleBeforeLeave(el: Element): void {
			if (enterName.value === CHAT_MESSAGE_TRANSITION) pinLeaving(el)
		},
	}
}
