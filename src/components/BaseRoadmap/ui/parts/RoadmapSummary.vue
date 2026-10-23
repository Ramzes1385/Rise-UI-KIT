<template>
	<div :class="[ui('summary'), { 'base-roadmap__summary--narrow': isNarrow }]">
		<div class="base-roadmap__summary-main">
			<div v-if="isNarrow" class="base-roadmap__summary-row base-roadmap__summary-row--narrow">
				<span class="base-roadmap__summary-percent">{{ percentText }}</span>
				<span class="base-roadmap__summary-text"
					>{{ doneText }}<template v-if="leftText"> · {{ leftText }}</template></span
				>
			</div>
			<div v-else class="base-roadmap__summary-row">
				<span class="base-roadmap__summary-text">
					<b class="base-roadmap__summary-done">{{ doneText }}</b> · {{ percentText }}
				</span>
				<span v-if="leftText" class="base-roadmap__summary-left">{{ leftText }}</span>
			</div>
			<BaseProgress class="base-roadmap__summary-progress" :value="summary.percent" :max="100" :aria-label="label" />
		</div>
		<BaseButton v-if="!isNarrow && summary.continueId" class="base-roadmap__continue" @click="onContinue">
			<template #left><BaseIcon name="play" /></template>
			{{ continueText }}
		</BaseButton>
		<slot name="summary-end" />
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { BaseProgress } from '@components/BaseProgress'
import { useRoadmapSummary } from '../../model/view/parts/useRoadmapSummary'
import type { RoadmapSummaryEmits, RoadmapSummaryProps, RoadmapSummarySlots } from '../../types/internal/roadmapView.types'

const props = defineProps<RoadmapSummaryProps>()
const emit = defineEmits<RoadmapSummaryEmits>()
defineSlots<RoadmapSummarySlots>()

const { doneText, percentText, leftText, continueText, label, onContinue } = useRoadmapSummary(props, emit)
</script>
