<template>
	<svg
		:class="['base-roadmap__status-icon', `base-roadmap__status-icon--${status}`]"
		width="16"
		height="16"
		viewBox="0 0 16 16"
		aria-hidden="true"
		focusable="false">
		<path v-if="status === 'locked'" class="base-roadmap__status-lock" d="M4.75 7.25h6.5v5.5h-6.5zM6 7.25V5.5a2 2 0 0 1 4 0v1.75" />
		<template v-else>
			<circle class="base-roadmap__status-track" cx="8" cy="8" r="6.25" />
			<circle
				class="base-roadmap__status-fill"
				cx="8"
				cy="8"
				r="6.25"
				pathLength="1"
				:style="{ strokeDasharray: `${fraction ?? 0} 1` }" />
			<circle class="base-roadmap__status-dot" cx="8" cy="8" r="7" />
			<path class="base-roadmap__status-check" d="m5.2 8.3 1.9 1.9 3.7-4" pathLength="1" />
		</template>
	</svg>
</template>

<script setup lang="ts">
import type { RoadmapStatusIconProps } from '../../types/internal/roadmapView.types'

defineProps<RoadmapStatusIconProps>()
</script>
