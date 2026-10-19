import { computed, ref } from 'vue'
import { UI_ROADMAP_REVIEW } from '@/locales/messages'
import type { RoadmapCommentThread } from '../../../types/roadmapEdit.types'
import type { RoadmapReviewContext, RoadmapReviewTarget, RoadmapReviewThreads } from '../../../types/internal/roadmapReview.types'
import {
	addComment,
	countUnread,
	createThread,
	markThreadRead,
	setThreadResolved,
	threadsByTarget,
	visibleThreads,
} from '@components/BaseFlowMap/model/review/reviewComments'

export function useReviewThreads(context: RoadmapReviewContext): RoadmapReviewThreads {
	const { options } = context
	const threads = computed(() => context.state.value.threads ?? [])
	const isResolvedShown = ref(true)
	const activeThreadId = ref<string | null>(null)
	const commitThreads = (next: RoadmapCommentThread[]): void => context.commit({ threads: next })
	const input = (text: string) => ({
		author: context.currentUser.value ?? { name: UI_ROADMAP_REVIEW.AUTHOR_GUEST },
		text,
		date: context.now(),
	})
	return {
		threads,
		isResolvedShown,
		activeThreadId,
		visibleThreads: computed(() => visibleThreads(threads.value, isResolvedShown.value)),
		unreadCount: computed(() => countUnread(threads.value)),
		startThread(target: RoadmapReviewTarget, text: string) {
			if (text.trim() === '') return null
			const next = createThread(threads.value, { target }, input(text))
			commitThreads(next)
			activeThreadId.value = next[next.length - 1].id
			options.announce(UI_ROADMAP_REVIEW.ANNOUNCE_COMMENT)
			return activeThreadId.value
		},
		reply(threadId: string, text: string, parentId?: string | null) {
			if (text.trim() === '') return
			commitThreads(addComment(threads.value, { threadId, parentId }, input(text)))
			options.announce(UI_ROADMAP_REVIEW.ANNOUNCE_REPLY)
		},
		setResolved(threadId: string, isResolved: boolean) {
			commitThreads(setThreadResolved(threads.value, threadId, isResolved))
			options.announce(isResolved ? UI_ROADMAP_REVIEW.ANNOUNCE_RESOLVED : UI_ROADMAP_REVIEW.ANNOUNCE_REOPENED)
		},
		openThread(threadId: string | null) {
			activeThreadId.value = threadId
			if (threadId === null || !threads.value.find(item => item.id === threadId)?.isUnread) return
			commitThreads(markThreadRead(threads.value, threadId))
		},
		threadsOf: target => threadsByTarget(threads.value).get(`${target.entity}:${target.id}`) ?? [],
	}
}
