<template>
	<div :class="[ui('topic'), modifiers]" :aria-busy="isBusy || undefined" :data-topic-id="view.topic.id">
		<span class="base-roadmap__topic-icon" aria-hidden="true" @click="onIconClick">
			<RoadmapStatusIcon :status="view.state.status" :fraction="fraction" />
		</span>
		<button type="button" class="base-roadmap__topic-button" :aria-pressed="view.isSelected" @click="onSelect">
			<slot :topic="view.topic" :state="view.state">
				<span class="base-roadmap__topic-title">{{ view.topic.title }}</span>
				<span v-if="view.isAlternative" class="base-roadmap__pill base-roadmap__pill--or">{{ orText }}</span>
				<span v-if="view.topic.isRecommended" class="base-roadmap__pill base-roadmap__pill--recommended">{{
					recommendedText
				}}</span>
				<span v-if="meta" class="base-roadmap__topic-meta">{{ meta }}</span>
			</slot>
			<span class="base-roadmap__sr">, {{ srText }}</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import RoadmapStatusIcon from './RoadmapStatusIcon.vue'
import { useRoadmapChip } from '../../model/view/parts/useRoadmapChip'
import type { RoadmapTopicChipEmits, RoadmapTopicChipProps, RoadmapTopicChipSlots } from '../../types/internal/roadmapView.types'

const props = defineProps<RoadmapTopicChipProps>()
const emit = defineEmits<RoadmapTopicChipEmits>()
defineSlots<RoadmapTopicChipSlots>()

const { modifiers, fraction, meta, srText, orText, recommendedText, onSelect, onIconClick } = useRoadmapChip(props, emit)
</script>
