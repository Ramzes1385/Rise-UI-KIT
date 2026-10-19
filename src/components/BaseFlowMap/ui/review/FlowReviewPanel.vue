<template>
	<section v-if="isActive" class="base-flow-map__review-panel" :aria-label="UI_FLOW_REVIEW.PANEL">
		<BaseTabs v-model="tab" :items="tabs" is-full-width>
			<template #panel-suggestions><FlowSuggestionList /></template>
			<template #panel-comments><FlowCommentList /></template>
			<template #panel-versions><FlowVersionList /></template>
		</BaseTabs>
		<FlowReviewStatus />
	</section>
</template>

<script setup lang="ts">
import { BaseTabs } from '@components/BaseTabs'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import FlowReviewStatus from './FlowReviewStatus.vue'
import FlowCommentList from './panel/FlowCommentList.vue'
import FlowVersionList from './panel/FlowVersionList.vue'
import FlowSuggestionList from './panel/FlowSuggestionList.vue'
import { useFlowReviewPanel } from '../../model/review/panel/useFlowReviewPanel'

const { isActive, tab, tabs } = useFlowReviewPanel()
</script>
