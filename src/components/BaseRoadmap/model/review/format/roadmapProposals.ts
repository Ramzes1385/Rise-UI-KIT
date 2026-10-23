import type { RoadmapProposal } from '../../../types/roadmapEdit.types'
import type { RoadmapSuggestion } from '../../../types/internal/roadmapReview.types'

export function toSuggestion(proposal: RoadmapProposal): RoadmapSuggestion {
	const status: RoadmapSuggestion['status'] = proposal.status === 'rejected' ? 'declined' : proposal.status
	return { ...proposal, status }
}

export function setProposalStatus(list: readonly RoadmapProposal[], id: string, status: RoadmapProposal['status']): RoadmapProposal[] {
	return list.map(item => (item.id === id ? { ...item, status } : item))
}
