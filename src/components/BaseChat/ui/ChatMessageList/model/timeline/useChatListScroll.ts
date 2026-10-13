import type { Ref } from 'vue'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useAutoScroll } from '@composables/interaction/useAutoScroll'
import type { ChatListScrollOptions } from '../../types/timeline/ChatTimeline.types'

const EDGE_PX = 48

function distanceToBottom(element: HTMLElement): number {
	return element.scrollHeight - element.scrollTop - element.clientHeight
}

function useHistoryLoading(listRef: Ref<HTMLElement | null>, options: ChatListScrollOptions) {
	const { getFirstId, hasIdBefore, canLoadMore, onLoadMore } = options

	function requestMore(): void {
		if (canLoadMore()) onLoadMore()
	}

	watch(getFirstId, (_, previous) => {
		const element = listRef.value
		if (!element || previous === undefined || !hasIdBefore(previous)) return
		const before = { height: element.scrollHeight, top: element.scrollTop }
		nextTick(() => {
			element.scrollTop = before.top + (element.scrollHeight - before.height)
		})
	})

	onMounted(() => {
		const element = listRef.value
		if (element && element.scrollHeight <= element.clientHeight) requestMore()
	})

	return {
		handleHistoryScroll(): void {
			if (listRef.value && listRef.value.scrollTop <= EDGE_PX) requestMore()
		},
	}
}

function useChatListScroll(listRef: Ref<HTMLElement | null>, options: ChatListScrollOptions) {
	const isStuck = ref(!options.hasUnread())
	const hasNewBelow = ref(false)
	let isForced = false
	let isMounted = false

	const { scrollToBottom } = useAutoScroll({
		container: listRef,
		enabled: () => isForced || isStuck.value || (isMounted && options.isLastOwn()),
		watchSource: options.getEndKey,
		isSmooth: options.isSmooth,
	})

	watch(options.getLastId, () => {
		if (!isStuck.value && !options.isLastOwn()) hasNewBelow.value = true
	})

	onMounted(() => {
		isMounted = true
		const divider = options.hasUnread() ? listRef.value?.querySelector<HTMLElement>('[data-chat-unread]') : null
		if (divider && listRef.value) listRef.value.scrollTop = Math.max(0, divider.offsetTop - EDGE_PX / 2)
	})

	return {
		hasNewBelow,
		...useHistoryLoading(listRef, options),
		handleEdgeScroll(): void {
			const element = listRef.value
			if (!element) return
			isStuck.value = distanceToBottom(element) <= EDGE_PX
			if (isStuck.value) hasNewBelow.value = false
		},
		handleJumpToNew(): void {
			isForced = true
			scrollToBottom()
			isForced = false
			hasNewBelow.value = false
		},
	}
}

export { useChatListScroll }
