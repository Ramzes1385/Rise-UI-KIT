<template>
	<div ref="rootRef" :class="[ui('layout'), 'base-roadmap__canvas', `base-roadmap__canvas--${kind}`]" :style="canvasStyle">
		<svg :class="[ui('spine'), 'base-roadmap__lines']" :viewBox="viewBox" aria-hidden="true" focusable="false">
			<path class="base-roadmap__spine-base" :d="geometry.spine" />
			<path class="base-roadmap__spine-halo" :d="geometry.spine" pathLength="1" :style="{ strokeDasharray: `${solid} 1` }" />
			<path class="base-roadmap__spine-done" :d="geometry.spine" pathLength="1" :style="{ strokeDasharray: `${solid} 1` }" />
			<path v-for="(d, index) in links" :key="index" class="base-roadmap__link" :d="d" />
		</svg>
		<span class="base-roadmap__runner-layer" aria-hidden="true">
			<span class="base-roadmap__runner" :style="{ offsetPath: `path('${geometry.spine}')`, '--rl-solid': solid }" />
		</span>
		<span class="base-roadmap__mark base-roadmap__mark--start" aria-hidden="true" :style="startStyle">
			<span class="base-roadmap__mark-label">{{ startText }}</span>
			<span class="base-roadmap__mark-dot" />
		</span>
		<ol class="base-roadmap__stages">
			<li
				v-for="item in items"
				:key="item.view.stage.id"
				:class="[
					ui('stage'),
					`base-roadmap__stage--${item.view.status}`,
					{ 'base-roadmap__stage--expanded': item.view.isExpanded },
				]">
				<RoadmapStageHeader
					class="base-roadmap__station"
					:style="item.style"
					:view="item.view"
					:ui="ui"
					:unlock-title="item.unlockTitle"
					@toggle="emit('toggle-stage', $event)">
					<template v-if="$slots['stage-header']" #default="slotProps"><slot name="stage-header" v-bind="slotProps" /></template>
				</RoadmapStageHeader>
				<Transition name="base-roadmap-reveal">
					<svg
						v-if="item.view.isExpanded && item.topics.length"
						class="base-roadmap__lines base-roadmap__branches"
						:viewBox="viewBox"
						aria-hidden="true"
						focusable="false">
						<path
							v-for="topic in item.topics"
							:key="topic.view.topic.id"
							class="base-roadmap__branch"
							:class="[
								`base-roadmap__branch--${topic.view.state.status}`,
								{ 'base-roadmap__branch--filtered': topic.view.isFiltered },
							]"
							:style="{ '--rl-i': topic.slot.index }"
							:d="topic.slot.branch"
							pathLength="1" />
					</svg>
				</Transition>
				<Transition name="base-roadmap-reveal">
					<ul
						v-if="item.view.isExpanded"
						:id="item.view.panelId"
						:aria-labelledby="item.view.headingId"
						class="base-roadmap__branch-list">
						<li
							v-for="topic in item.topics"
							:key="topic.view.topic.id"
							class="base-roadmap__branch-item"
							:class="`base-roadmap__branch-item--${topic.slot.side}`"
							:style="topic.style">
							<RoadmapTopicChip
								:view="topic.view"
								:ui="ui"
								:missing="topic.missing"
								:is-busy="topic.view.isBusy"
								@select="emit('select-topic', $event)"
								@toggle="emit('toggle-topic', $event)">
								<template v-if="$slots.topic" #default="slotProps"><slot name="topic" v-bind="slotProps" /></template>
							</RoadmapTopicChip>
						</li>
					</ul>
				</Transition>
			</li>
		</ol>
		<div class="base-roadmap__mark base-roadmap__mark--goal" :aria-hidden="goal ? undefined : true" :style="goalStyle">
			<span class="base-roadmap__goal-flag" aria-hidden="true">
				<svg width="14" height="14" viewBox="0 0 16 16" focusable="false"><path d="M3.5 14.5V2M3.5 2.5h8l-1.75 3 1.75 3h-8" /></svg>
			</span>
			<span v-if="goal" class="base-roadmap__goal-text">{{ goal }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import RoadmapTopicChip from '../parts/RoadmapTopicChip.vue'
import RoadmapStageHeader from '../parts/RoadmapStageHeader.vue'
import { useRoadmapLayout } from '../../model/layout/useRoadmapLayout'
import type { RoadmapLayoutSlots } from '../../types/internal/roadmapView.types'
import type { RoadmapCanvasProps } from '../../types/internal/roadmapLayout.types'
import type { RoadmapLayoutEmits } from '../../types/internal/roadmapInternal.types'

const props = defineProps<RoadmapCanvasProps>()
const emit = defineEmits<RoadmapLayoutEmits>()
defineSlots<RoadmapLayoutSlots>()

const { rootRef, geometry, items, links, solid, canvasStyle, viewBox, startStyle, goalStyle, startText } = useRoadmapLayout(props)
</script>
