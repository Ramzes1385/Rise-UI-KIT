import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { useReviewPins } from '../layer/useReviewLayer'
import { useFlowReviewState } from '../useFlowReviewState'
import { useFlowMapContext } from '../../context/flowContext'
import type { FlowCommentThread } from '../../../types/data/flowReview.types'

export function useFlowReviewPins() {
	const map = useFlowMapContext()
	const review = useFlowReviewState()
	const { comments } = review
	const pins = useReviewPins(map, review)
	return {
		pins,
		activeId: comments.activeId,
		currentUser: review.currentUser,
		isOpen: (thread: FlowCommentThread) => comments.activeId.value === thread.id,
		setOpen: (thread: FlowCommentThread, isOpen: boolean) => comments.open(isOpen ? thread.id : null),
		reply: (thread: FlowCommentThread, value: { parentId: string | null; text: string }) =>
			comments.reply(thread.id, value.text, value.parentId),
		toggleResolved: (thread: FlowCommentThread) => comments.setResolved(thread.id, !thread.isResolved),
		resolveLabel: (thread: FlowCommentThread) => (thread.isResolved ? UI_FLOW_REVIEW.REOPEN : UI_FLOW_REVIEW.RESOLVE),
		threadLabel: (thread: FlowCommentThread) => formatMessage(UI_FLOW_REVIEW.THREAD, { count: thread.comments.length }),
	}
}
