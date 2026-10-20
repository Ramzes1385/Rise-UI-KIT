import { computed, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_REVIEW } from '@/locales/messages'
import { proposalTitle } from '../format/roadmapReviewLabels'
import { nextRoadmapReviewId } from '../format/roadmapReviewIds'
import { setProposalStatus, toSuggestion } from '../format/roadmapProposals'
import type { RoadmapChange, RoadmapProposal } from '../../../types/roadmapEdit.types'
import { isRoadmapProposalStale, roadmapReviewAdapter } from '../format/roadmapReviewAdapter'
import { createSuggestionView, filterSuggestions, sortSuggestions } from '@components/BaseFlowMap/model/review/data/reviewSuggestions'
import type {
	RoadmapProposalView,
	RoadmapReviewContext,
	RoadmapReviewProposals,
	RoadmapReviewShow,
} from '../../../types/internal/roadmapReview.types'

function labelOf(proposal: RoadmapProposal, context: RoadmapReviewContext): string {
	return proposal.label ?? proposalTitle(proposal.changes, context.options.data())
}

function propose(
	context: RoadmapReviewContext,
	list: RoadmapProposal[],
	draft: Pick<RoadmapProposal, 'changes' | 'label'>,
): RoadmapProposal | null {
	const { changes, label } = draft
	if (changes.length === 0) return null
	const author = context.currentUser.value ?? { name: UI_ROADMAP_REVIEW.AUTHOR_GUEST }
	const id = nextRoadmapReviewId(
		'p',
		list.map(item => item.id),
	)
	const proposal: RoadmapProposal = { id, author, date: context.now(), label, changes, status: 'open' }
	context.commit({ proposals: [...list, proposal] })
	context.options.announce(formatMessage(UI_ROADMAP_REVIEW.ANNOUNCE_SENT, { label: labelOf(proposal, context) }))
	return proposal
}

function createViews(context: RoadmapReviewContext, proposals: () => RoadmapProposal[], show: () => RoadmapReviewShow) {
	return computed<RoadmapProposalView[]>(() => {
		const data = context.options.data()
		const filter = { show: show(), currentUser: context.currentUser.value?.name, isDoneShown: true }
		const byId = new Map(proposals().map(item => [item.id, item]))
		const shown = sortSuggestions(filterSuggestions(proposals().map(toSuggestion), filter))
		return shown.map(suggestion => {
			const proposal = byId.get(suggestion.id)!
			const view = createSuggestionView(suggestion, { data }, roadmapReviewAdapter)
			const isStale = proposal.status === 'open' && isRoadmapProposalStale(data, proposal.changes)
			return { proposal, view: { ...view, isStale } }
		})
	})
}

export function useReviewProposals(context: RoadmapReviewContext): RoadmapReviewProposals {
	const { options, commit } = context
	const proposals = computed(() => context.state.value.proposals ?? [])
	const show = ref<RoadmapReviewShow>('all')
	const views = createViews(
		context,
		() => proposals.value,
		() => show.value,
	)
	const decide = (id: string, status: RoadmapProposal['status']): void => {
		commit({ proposals: setProposalStatus(proposals.value, id, status) })
	}
	const accept = async (id: string): Promise<boolean> => {
		const proposal = proposals.value.find(item => item.id === id)
		if (!proposal || proposal.status !== 'open') return false
		if (isRoadmapProposalStale(options.data(), proposal.changes)) return false
		const label = labelOf(proposal, context)
		const onStep = (direction: 'undo' | 'redo'): void => decide(id, direction === 'undo' ? 'open' : 'accepted')
		if ((await options.apply(proposal.changes, label, onStep)) === false) return false
		decide(id, 'accepted')
		options.announce(formatMessage(UI_ROADMAP_REVIEW.ANNOUNCE_ACCEPTED, { label }))
		return true
	}
	const isReady = (item: RoadmapProposalView): boolean => item.proposal.status === 'open' && !item.view.isStale
	return {
		proposals,
		views,
		show,
		readyCount: computed(() => views.value.filter(isReady).length),
		openCount: computed(() => proposals.value.filter(item => item.status === 'open').length),
		accept,
		propose: (changes: RoadmapChange[], label?: string) => propose(context, proposals.value, { changes, label }),
		async acceptAll() {
			let accepted = 0
			for (const item of views.value.filter(isReady)) accepted += (await accept(item.proposal.id)) ? 1 : 0
			return accepted
		},
		decline(id: string) {
			const proposal = proposals.value.find(item => item.id === id)
			if (!proposal || proposal.status !== 'open') return
			decide(id, 'rejected')
			options.announce(formatMessage(UI_ROADMAP_REVIEW.ANNOUNCE_DECLINED, { label: labelOf(proposal, context) }))
		},
	}
}
