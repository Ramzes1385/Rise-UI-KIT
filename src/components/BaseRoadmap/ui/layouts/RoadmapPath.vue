<template>
	<RoadmapCanvas
		kind="path"
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
</template>

<script setup lang="ts">
import RoadmapCanvas from './RoadmapCanvas.vue'
import type { RoadmapLayoutSlots } from '../../types/internal/roadmapView.types'
import type { RoadmapLayoutEmits, RoadmapLayoutProps } from '../../types/internal/roadmapInternal.types'

defineProps<RoadmapLayoutProps>()
const emit = defineEmits<RoadmapLayoutEmits>()
defineSlots<RoadmapLayoutSlots>()
</script>
