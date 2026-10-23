<template>
	<BaseScrollArea orientation="horizontal" class="base-roadmap__scroll">
		<RoadmapCanvas
			kind="horizontal"
			:stages="stages"
			:progress="progress"
			:goal="goal"
			:ui="ui"
			@toggle-stage="emit('toggle-stage', $event)"
			@select-topic="emit('select-topic', $event)"
			@toggle-topic="emit('toggle-topic', $event)">
			<template v-if="$slots.topic" #topic="slotProps"><slot name="topic" v-bind="slotProps" /></template>
			<template v-if="$slots['stage-header']" #stage-header="slotProps"><slot name="stage-header" v-bind="slotProps" /></template>
		</RoadmapCanvas>
	</BaseScrollArea>
</template>

<script setup lang="ts">
import RoadmapCanvas from './RoadmapCanvas.vue'
import { BaseScrollArea } from '@components/BaseScrollArea'
import type { RoadmapLayoutSlots } from '../../types/internal/roadmapView.types'
import type { RoadmapLayoutEmits, RoadmapLayoutProps } from '../../types/internal/roadmapInternal.types'

defineProps<RoadmapLayoutProps>()
const emit = defineEmits<RoadmapLayoutEmits>()
defineSlots<RoadmapLayoutSlots>()
</script>
