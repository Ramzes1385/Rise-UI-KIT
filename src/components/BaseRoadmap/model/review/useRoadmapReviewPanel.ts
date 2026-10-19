import { computed, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import type { TabItem } from '@components/BaseTabs'
import { UI_ROADMAP_REVIEW } from '@/locales/messages'
import { formatRelativeTime } from '@utils/data/dateUtils'
import { roadmapDescribeAdapter } from './roadmapReviewAdapter'
import type { RoadmapData } from '../../types/roadmapData.types'
import type { RoadmapCommentThread } from '../../types/roadmapEdit.types'
import { proposalTitle, roadmapElementName } from './roadmapReviewLabels'
import { initialsOf } from '@components/BaseFlowMap/model/review/reviewSuggestions'
import { buildReviewMarks, markKey } from '@components/BaseFlowMap/model/review/reviewDiff'
import { commentCount, latestComment } from '@components/BaseFlowMap/model/review/reviewComments'
import { fieldLabel, formatCount, formatValue, kindLabel, kindStatus, summaryText } from './roadmapReviewFormat'
import type { RoadmapProposalView, RoadmapReviewState, RoadmapReviewTarget } from '../../types/internal/roadmapReview.types'

const MAX_FIELDS = 3

function fieldRows(item: RoadmapProposalView) {
	return buildReviewMarks(item.proposal.changes, roadmapDescribeAdapter)
		.flatMap(mark => mark.fields.map(field => ({ key: `${markKey(mark.entity, mark.id)}:${field.field}`, ...field })))
		.slice(0, MAX_FIELDS)
		.map(row => ({
			key: row.key,
			field: fieldLabel(row.field),
			before: formatValue(row.field, row.before),
			after: formatValue(row.field, row.after),
		}))
}

function toProposalItem(item: RoadmapProposalView, data: RoadmapData) {
	const { proposal, view } = item
	return {
		id: proposal.id,
		name: proposal.author.name,
		avatar: proposal.author.avatar,
		initials: initialsOf(proposal.author.name),
		time: formatRelativeTime(proposal.date),
		kind: kindLabel(view.kind),
		kindStatus: kindStatus(view.kind),
		title: proposal.label ?? proposalTitle(proposal.changes, data),
		summary: summaryText(view.counts),
		fields: fieldRows(item),
		status: proposal.status,
		isOpen: proposal.status === 'open',
		isStale: view.isStale,
		label: formatMessage(UI_ROADMAP_REVIEW.PROPOSAL_ARIA, {
			title: proposal.label ?? proposalTitle(proposal.changes, data),
			name: proposal.author.name,
		}),
	}
}

function threadStatus(thread: RoadmapCommentThread): string {
	if (thread.isResolved) return UI_ROADMAP_REVIEW.THREAD_RESOLVED
	return thread.isUnread ? UI_ROADMAP_REVIEW.THREAD_NEW : UI_ROADMAP_REVIEW.THREAD_OPEN
}

function toThreadItem(thread: RoadmapCommentThread, data: RoadmapData, activeId: string | null) {
	const last = latestComment(thread)
	return {
		thread,
		id: thread.id,
		target: roadmapElementName(data, thread.target.entity, thread.target.id),
		text: last?.text ?? '',
		time: last ? formatRelativeTime(last.date) : '',
		count: commentCount(thread.comments),
		status: threadStatus(thread),
		isOpen: activeId === thread.id,
	}
}

export function useRoadmapReviewPanel(
	review: RoadmapReviewState,
	data: () => RoadmapData,
	target: () => RoadmapReviewTarget | null | undefined,
) {
	const tab = ref('proposals')
	const draft = ref('')
	const tabs = computed<TabItem[]>(() => [
		{ id: 'proposals', label: `${UI_ROADMAP_REVIEW.TAB_PROPOSALS} ${review.openCount.value}` },
		{ id: 'comments', label: `${UI_ROADMAP_REVIEW.TAB_COMMENTS} ${review.threads.value.length}` },
	])
	const proposalItems = computed(() => review.views.value.map(item => toProposalItem(item, data())))
	const threadItems = computed(() => review.visibleThreads.value.map(thread => toThreadItem(thread, data(), review.activeThreadId.value)))
	const targetName = computed(() => {
		const current = target()
		return current ? roadmapElementName(data(), current.entity, current.id) : ''
	})
	const canComment = computed(() => Boolean(target()) && Boolean(review.currentUser.value))
	return {
		tab,
		tabs,
		showOptions: [
			{ value: 'all', label: UI_ROADMAP_REVIEW.SHOW_ALL },
			{ value: 'mine', label: UI_ROADMAP_REVIEW.SHOW_MINE },
			{ value: 'open', label: UI_ROADMAP_REVIEW.SHOW_OPEN },
		],
		show: review.show,
		isResolvedShown: review.isResolvedShown,
		draft,
		proposalItems,
		threadItems,
		canComment,
		isProposalsEmpty: computed(() => proposalItems.value.length === 0),
		isThreadsEmpty: computed(() => threadItems.value.length === 0),
		acceptAllLabel: computed(() => formatCount(UI_ROADMAP_REVIEW.ACCEPT_ALL, review.readyCount.value)),
		composerLabel: computed(() => formatMessage(UI_ROADMAP_REVIEW.COMMENT_ON, { name: targetName.value })),
		send(): void {
			const current = target()
			if (current && review.startThread(current, draft.value)) draft.value = ''
		},
		toggleThread: (id: string) => review.openThread(review.activeThreadId.value === id ? null : id),
		resolveLabel: (thread: RoadmapCommentThread) => (thread.isResolved ? UI_ROADMAP_REVIEW.REOPEN : UI_ROADMAP_REVIEW.RESOLVE),
	}
}
