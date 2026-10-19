<template>
	<div v-if="isOpen" class="base-flow-map__review-compare" role="group" :aria-label="UI_FLOW_REVIEW.COMPARE">
		<span class="base-flow-map__review-caption">{{ UI_FLOW_REVIEW.COMPARE }}</span>
		<BaseSegmented v-model="side" :options="options" :aria-label="UI_FLOW_REVIEW.COMPARE_LAYER" />
		<span v-if="summary" class="base-flow-map__review-summary">{{ summary }}</span>
		<BaseButton variant="ghost" :aria-label="UI_FLOW_REVIEW.COMPARE_CLOSE" @click="close">
			<BaseIcon name="x-mark" />
		</BaseButton>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseSegmented } from '@components/BaseSegmented'
import { useFlowReviewCompare } from '../../model/review/bar/useFlowReviewCompare'

const { isOpen, options, side, summary, close } = useFlowReviewCompare()
</script>
