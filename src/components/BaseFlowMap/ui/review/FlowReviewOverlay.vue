<template>
	<div v-if="isActive" class="base-flow-map__review">
		<FlowReviewToolbar />
		<FlowReviewCompareBar />
		<FlowReviewPins />
	</div>
</template>

<script setup lang="ts">
import FlowReviewPins from './FlowReviewPins.vue'
import FlowReviewToolbar from './FlowReviewToolbar.vue'
import FlowReviewCompareBar from './FlowReviewCompareBar.vue'
import { useFlowReviewState } from '../../model/review/useFlowReviewState'

const { isActive } = useFlowReviewState()
</script>
