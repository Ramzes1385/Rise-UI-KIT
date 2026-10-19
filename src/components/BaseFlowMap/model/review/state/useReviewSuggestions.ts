import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { suggestionTitle } from '../flowReviewLabels'
import { flowReviewAdapter } from '../flowReviewAdapter'
import { computed, onScopeDispose, ref, shallowRef, watch } from 'vue'
import type { FlowSuggestion } from '../../../types/data/flowReview.types'
import type { FlowModelProps } from '../../../types/internal/flowModel.types'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'
import type { FlowReviewSuggestions, ReviewSuggestionParts } from '../../../types/internal/review/reviewState.types'
import {
	countSuggestions,
	createSuggestionView,
	filterSuggestions,
	groupChanges,
	sortSuggestions,
	suggestionAuthors,
} from '../reviewSuggestions'

export const REVIEW_INTERNAL_HANDLER = 'flowReviewInternal'

function mirrorSuggestions(model: FlowModelInternal, props: FlowModelProps) {
	const list = shallowRef<FlowSuggestion[]>([...(props.suggestions ?? [])])
	watch(
		() => props.suggestions,
		value => (list.value = [...(value ?? [])]),
	)
	const onUpdate = (value: FlowSuggestion[]): void => void (list.value = value)
	Object.defineProperty(onUpdate, 'name', { value: REVIEW_INTERNAL_HANDLER })
	onScopeDispose(model.events.subscribe('update:suggestions', onUpdate))
	return list
}

function labelOf(list: readonly FlowSuggestion[], id: string): string {
	return list.find(item => item.id === id)?.label ?? UI_FLOW_REVIEW.SUGGESTION_UNTITLED
}

function createViews(model: FlowModelInternal, props: FlowModelProps, parts: ReviewSuggestionParts & { list: () => FlowSuggestion[] }) {
	const { filters } = parts
	return computed(() => {
		const context = { data: model.data.value, versionId: parts.versionId() }
		const filter = {
			show: filters.show.value,
			hiddenAuthors: filters.hidden.value,
			currentUser: props.currentUser?.name,
			isDoneShown: filters.isDoneShown.value,
		}
		return sortSuggestions(filterSuggestions(parts.list(), filter)).map(item => createSuggestionView(item, context, flowReviewAdapter))
	})
}

export function useReviewSuggestions(model: FlowModelInternal, props: FlowModelProps, parts: ReviewSuggestionParts): FlowReviewSuggestions {
	const list = mirrorSuggestions(model, props)
	const { controller } = model
	const views = createViews(model, props, { ...parts, list: () => list.value })
	const skipped = ref(0)
	const draftChanges = computed(() => (model.draft.value?.changes ?? []).slice(skipped.value))
	watch(model.draft, value => (skipped.value = value ? Math.min(skipped.value, value.changes.length) : 0))
	const discard = (): void => {
		skipped.value = model.draft.value?.changes.length ?? 0
	}
	const accept = async (id: string): Promise<boolean> => {
		const label = labelOf(list.value, id)
		const result = await controller.accept(id)
		if (result.isApplied) parts.announce(formatMessage(UI_FLOW_REVIEW.ANNOUNCE_ACCEPTED, { label }))
		return result.isApplied
	}
	return {
		list,
		views,
		authors: computed(() => suggestionAuthors(list.value)),
		counts: computed(() => countSuggestions(list.value)),
		draftChanges,
		focusId: shallowRef<string | null>(null),
		draftCount: computed(() => groupChanges(draftChanges.value, flowReviewAdapter).length),
		discard,
		submit() {
			const data = model.data.value
			const groups = groupChanges(draftChanges.value, flowReviewAdapter)
			const sent = groups.flatMap(group => controller.suggest(group, suggestionTitle(group, data)) ?? [])
			discard()
			if (sent.length > 0) parts.announce(formatMessage(UI_FLOW_REVIEW.ANNOUNCE_SENT, { count: sent.length }))
			return sent
		},
		accept,
		async acceptAll() {
			const ready = views.value.filter(item => item.suggestion.status === 'open' && !item.isStale)
			let accepted = 0
			for (const item of ready) accepted += (await accept(item.suggestion.id)) ? 1 : 0
			return accepted
		},
		decline(id) {
			const label = labelOf(list.value, id)
			controller.decline(id)
			parts.announce(formatMessage(UI_FLOW_REVIEW.ANNOUNCE_DECLINED, { label }))
		},
	}
}
