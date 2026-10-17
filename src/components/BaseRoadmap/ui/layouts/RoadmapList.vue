<template>
	<ol :class="[ui('layout'), 'base-roadmap__list']">
		<li
			v-for="stageView in stages"
			:key="stageView.stage.id"
			:class="[ui('stage'), `base-roadmap__stage--${stageView.status}`, { 'base-roadmap__stage--expanded': stageView.isExpanded }]">
			<RoadmapStageHeader
				:view="stageView"
				:ui="ui"
				:unlock-title="firstUnmetTitle(stageView.stage.requires, stages)"
				:is-static="stageView.status === 'locked'"
				@toggle="emit('toggle-stage', $event)">
				<template v-if="$slots['stage-header']" #default="slotProps"><slot name="stage-header" v-bind="slotProps" /></template>
			</RoadmapStageHeader>
			<Transition
				:css="false"
				@before-enter="expand.onBeforeEnter"
				@enter="expand.onEnter"
				@after-enter="expand.onAfterEnter"
				@before-leave="expand.onBeforeLeave"
				@leave="expand.onLeave"
				@after-leave="expand.onAfterLeave">
				<ul v-if="stageView.isExpanded" :id="stageView.panelId" :aria-labelledby="stageView.headingId" class="base-roadmap__topics">
					<li v-for="topicView in stageView.topics" :key="topicView.topic.id" class="base-roadmap__topics-item">
						<RoadmapTopicChip
							:view="topicView"
							:ui="ui"
							:missing="titlesOf(topicView.state.missing, stages)"
							@select="emit('select-topic', $event)"
							@toggle="emit('toggle-topic', $event)">
							<template v-if="$slots.topic" #default="slotProps"><slot name="topic" v-bind="slotProps" /></template>
						</RoadmapTopicChip>
					</li>
				</ul>
			</Transition>
		</li>
	</ol>
</template>

<script setup lang="ts">
import RoadmapTopicChip from '../parts/RoadmapTopicChip.vue'
import RoadmapStageHeader from '../parts/RoadmapStageHeader.vue'
import { useRoadmapList } from '../../model/view/parts/useRoadmapList'
import type { RoadmapLayoutSlots } from '../../types/internal/roadmapView.types'
import { firstUnmetTitle, titlesOf } from '../../model/view/format/roadmapRequirements'
import type { RoadmapLayoutEmits, RoadmapLayoutProps } from '../../types/internal/roadmapInternal.types'

defineProps<RoadmapLayoutProps>()
const emit = defineEmits<RoadmapLayoutEmits>()
defineSlots<RoadmapLayoutSlots>()

const { expand } = useRoadmapList()
</script>
