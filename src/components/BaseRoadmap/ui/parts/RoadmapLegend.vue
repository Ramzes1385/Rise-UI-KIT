<template>
	<ul :class="['base-roadmap__legend', ui('status')]" :aria-label="UI_ROADMAP.LEGEND_LABEL">
		<li v-for="item in legendItems()" :key="item.key" class="base-roadmap__legend-item">
			<RoadmapStatusIcon :status="item.status" :fraction="item.fraction" />
			{{ item.label }}
		</li>
		<li class="base-roadmap__legend-item">
			<span class="base-roadmap__legend-box" aria-hidden="true" />
			{{ UI_ROADMAP.KIND_OPTIONAL }}
		</li>
		<li class="base-roadmap__legend-item">
			<span class="base-roadmap__pill base-roadmap__pill--or" aria-hidden="true">{{ UI_ROADMAP.OR }}</span>
			{{ UI_ROADMAP.KIND_ALTERNATIVE }}
		</li>
	</ul>
</template>

<script setup lang="ts">
import { UI_ROADMAP } from '@/locales/messages'
import RoadmapStatusIcon from './RoadmapStatusIcon.vue'
import { legendItems } from '../../model/view/format/roadmapLegend'
import type { RoadmapLegendProps } from '../../types/internal/roadmapView.types'

defineProps<RoadmapLegendProps>()
</script>
