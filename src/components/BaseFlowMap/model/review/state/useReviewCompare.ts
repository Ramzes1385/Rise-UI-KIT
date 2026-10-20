import { computed, ref, watch } from 'vue'
import { flowReviewAdapter } from '../flowReviewAdapter'
import type { FlowModelProps } from '../../../types/internal/flowModel.types'
import type { FlowReviewCompare } from '../../../types/internal/review/reviewState.types'
import { toTimestamp, describeChanges, summarizeChanges } from '../data/reviewSuggestions'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'

export function useReviewCompare(model: FlowModelInternal, props: FlowModelProps): FlowReviewCompare {
	const compareId = ref<string | null>(props.compareWith ?? null)
	watch(
		() => props.compareWith,
		value => (compareId.value = value ?? null),
	)
	const versions = computed(() => [...(props.versions ?? [])].sort((first, second) => toTimestamp(second.date) - toTimestamp(first.date)))
	const changes = computed(() => (compareId.value === null ? [] : model.controller.compare(compareId.value)))
	return {
		versions,
		currentId: computed(() => versions.value[0]?.id),
		compareId,
		side: ref('diff'),
		changes,
		counts: computed(() => summarizeChanges(describeChanges(changes.value, flowReviewAdapter))),
		select: id => (compareId.value = id),
	}
}
