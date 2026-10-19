import { flowAuthor } from '../flowReviewAdapter'
import { computed, ref, shallowRef, watch } from 'vue'
import type { FlowCommentThread } from '../../../types/data/flowReview.types'
import type { FlowModelProps } from '../../../types/internal/flowModel.types'
import type { FlowCommentEvent } from '../../../types/api/flowController.types'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'
import type { FlowCommentTarget, FlowReviewComments } from '../../../types/internal/review/reviewState.types'
import { addComment, countUnread, createThread, markThreadRead, setThreadResolved, visibleThreads } from '../reviewComments'

const JUST_CLOSED_MS = 300

export function useReviewComments(model: FlowModelInternal, props: FlowModelProps): FlowReviewComments {
	const list = shallowRef<FlowCommentThread[]>([...(props.comments ?? [])])
	watch(
		() => props.comments,
		value => (list.value = [...(value ?? [])]),
	)
	const isResolvedShown = ref(true)
	const activeId = ref<string | null>(null)
	let closed = { id: '', at: 0 }
	const commit = (next: FlowCommentThread[], threadId: string, action: FlowCommentEvent['action']): void => {
		list.value = next
		model.events.emit('update:comments', next)
		const thread = next.find(item => item.id === threadId)
		if (thread) model.events.emit('comment', { thread, action })
	}
	const input = (text: string) => ({ author: flowAuthor(props.currentUser), text, date: Date.now() })
	return {
		list,
		visible: computed(() => visibleThreads(list.value, isResolvedShown.value)),
		unread: computed(() => countUnread(list.value)),
		isResolvedShown,
		activeId,
		start(target: FlowCommentTarget, text) {
			if (text.trim() === '') return null
			const next = createThread(list.value, target, input(text))
			const created = next[next.length - 1]
			commit(next, created.id, 'add')
			activeId.value = created.id
			return created.id
		},
		reply(threadId, text, parentId) {
			if (text.trim() === '') return
			commit(addComment(list.value, { threadId, parentId }, input(text)), threadId, 'reply')
		},
		setResolved(threadId, isResolved) {
			commit(setThreadResolved(list.value, threadId, isResolved), threadId, isResolved ? 'resolve' : 'reopen')
		},
		isJustClosed: id => closed.id === id && Date.now() - closed.at < JUST_CLOSED_MS,
		open(threadId) {
			if (threadId === null && activeId.value !== null) closed = { id: activeId.value, at: Date.now() }
			activeId.value = threadId
			if (threadId === null) return
			const found = list.value.find(item => item.id === threadId)
			if (!found?.isUnread) return
			list.value = markThreadRead(list.value, threadId)
			model.events.emit('update:comments', list.value)
		},
	}
}
