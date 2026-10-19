import { computed, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { useFlowReviewState } from '../useFlowReviewState'
import { formatRelativeTime } from '@utils/data/dateUtils'
import { useFlowMapContext } from '../../context/flowContext'
import { elementName, entityOfId } from '../flowReviewLabels'
import { commentCount, latestComment } from '../reviewComments'
import type { FlowCommentThread } from '../../../types/data/flowReview.types'
import type { FlowReviewState } from '../../../types/internal/review/reviewState.types'

function targetOf(thread: FlowCommentThread, data: Parameters<typeof elementName>[1]): string {
	if (!thread.target) return UI_FLOW_REVIEW.THREAD_POINT
	return elementName({ entity: thread.target.entity, id: thread.target.id }, data)
}

function statusOf(thread: FlowCommentThread): string {
	if (thread.isResolved) return UI_FLOW_REVIEW.THREAD_RESOLVED
	return thread.isUnread ? UI_FLOW_REVIEW.THREAD_NEW : UI_FLOW_REVIEW.THREAD_OPEN
}

export function useFlowCommentList() {
	const map = useFlowMapContext()
	const review = useFlowReviewState()
	const { comments } = review
	const draft = ref('')
	const selected = computed(() => map.model.selection.value[0])
	const selectedName = computed(() => {
		const id = selected.value
		if (!id) return ''
		const data = map.model.data.value
		return elementName({ entity: entityOfId(data, id), id }, data)
	})
	const items = computed(() =>
		comments.visible.value.map(thread => {
			const last = latestComment(thread)
			return {
				thread,
				id: thread.id,
				target: targetOf(thread, map.model.data.value),
				text: last?.text ?? '',
				time: last ? formatRelativeTime(last.date) : '',
				count: commentCount(thread.comments),
				status: statusOf(thread),
				isOpen: comments.activeId.value === thread.id,
			}
		}),
	)
	const send = (): void => {
		const id = selected.value
		if (!id) return
		const entity = entityOfId(map.model.data.value, id)
		if (comments.start({ target: { entity, id } }, draft.value)) draft.value = ''
	}
	return {
		items,
		draft,
		send,
		isEmpty: computed(() => items.value.length === 0),
		isCompact: map.isCompact,
		canComment: computed(() => Boolean(selected.value) && Boolean(review.currentUser.value)),
		composerLabel: computed(() => formatMessage(UI_FLOW_REVIEW.COMMENT_ON, { name: selectedName.value })),
		isResolvedShown: comments.isResolvedShown,
		currentUser: review.currentUser,
		...threadActions(review),
	}
}

function threadActions(review: FlowReviewState) {
	const { comments, controller } = review
	return {
		toggle: (thread: FlowCommentThread) => comments.open(comments.activeId.value === thread.id ? null : thread.id),
		show: (thread: FlowCommentThread) => thread.target && controller.focus(thread.target.id),
		reply: (thread: FlowCommentThread, value: { parentId: string | null; text: string }) =>
			comments.reply(thread.id, value.text, value.parentId),
		resolve: (thread: FlowCommentThread) => comments.setResolved(thread.id, !thread.isResolved),
		resolveLabel: (thread: FlowCommentThread) => (thread.isResolved ? UI_FLOW_REVIEW.REOPEN : UI_FLOW_REVIEW.RESOLVE),
	}
}
