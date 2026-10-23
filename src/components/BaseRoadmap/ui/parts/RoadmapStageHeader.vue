<template>
	<h3 :id="view.headingId" :class="[ui('stage-header'), `base-roadmap__stage-header--${view.status}`]">
		<button
			type="button"
			class="base-roadmap__stage-button"
			:aria-expanded="isStatic ? undefined : view.isExpanded"
			:aria-controls="view.isExpanded ? view.panelId : undefined"
			:aria-disabled="isStatic || undefined"
			@click="onToggle">
			<slot :stage="view.stage" :status="view.status">
				<span class="base-roadmap__stage-ring">
					<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
						<circle class="base-roadmap__stage-track" cx="18" cy="18" r="16" />
						<circle
							class="base-roadmap__stage-fill"
							cx="18"
							cy="18"
							r="16"
							pathLength="1"
							:style="{ strokeDasharray: `${progress} 1` }" />
						<circle class="base-roadmap__stage-disc" cx="18" cy="18" r="12" />
						<path class="base-roadmap__stage-check" d="m13 18.5 3.5 3.5 6.5-7" pathLength="1" />
						<path class="base-roadmap__stage-lock" d="M13.75 17.25h8.5v6.5h-8.5zM15.5 17.25v-2a2.5 2.5 0 0 1 5 0v2" />
					</svg>
					<span class="base-roadmap__stage-number" aria-hidden="true">{{ view.index + 1 }}</span>
				</span>
				<span class="base-roadmap__stage-text">
					<span class="base-roadmap__sr">{{ numberText }}, </span>
					<span class="base-roadmap__stage-title">{{ view.stage.title }}</span>
					<span v-if="statusText" class="base-roadmap__sr">, {{ statusText }}</span>
					<span class="base-roadmap__stage-meta">{{ metaText }}</span>
				</span>
				<span v-if="!isStatic" class="base-roadmap__chevron" aria-hidden="true"><BaseIcon name="chevron-down" /></span>
				<span v-if="view.status === 'current'" class="base-roadmap__here" aria-hidden="true">{{ hereText }}</span>
			</slot>
		</button>
	</h3>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { useRoadmapStageHeader } from '../../model/view/parts/useRoadmapStageHeader'
import type { RoadmapStageHeaderEmits, RoadmapStageHeaderProps, RoadmapStageHeaderSlots } from '../../types/internal/roadmapView.types'

const props = defineProps<RoadmapStageHeaderProps>()
const emit = defineEmits<RoadmapStageHeaderEmits>()
defineSlots<RoadmapStageHeaderSlots>()

const { progress, numberText, statusText, metaText, hereText, onToggle } = useRoadmapStageHeader(props, emit)
</script>
