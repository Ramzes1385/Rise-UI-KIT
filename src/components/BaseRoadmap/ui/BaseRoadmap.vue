<template>
	<section
		ref="rootRef"
		class="base-roadmap"
		:class="[variantClass, classes.root, { 'base-roadmap--narrow': isNarrow }]"
		:style="[sizeScaleStyle, customColorStyle]"
		:aria-label="ariaLabel ?? data.title"
		:aria-busy="isLoading || undefined"
		:aria-disabled="isDisabled || undefined"
		role="region"
		@keydown="onDetailsKeydown">
		<div class="base-roadmap__sr" role="status" aria-live="polite" aria-atomic="true">{{ liveText }}</div>
		<div v-if="isLoading" class="base-roadmap__loading" role="group" :aria-label="UI_ROADMAP.LOADING">
			<BaseSkeleton shape="rect" height="56" />
			<BaseSkeleton v-for="row in 4" :key="row" shape="rect" height="40" />
		</div>
		<template v-else>
			<header :class="ui('header')">
				<div class="base-roadmap__headline">
					<h2 class="base-roadmap__title">{{ data.title }}</h2>
					<p v-if="subtitle" class="base-roadmap__subtitle">{{ subtitle }}</p>
				</div>
				<RoadmapSummary
					v-if="hasSummary && data.stages.length"
					:summary="summaryView"
					:ui="ui"
					:is-narrow="isNarrow"
					@continue="continueLearning">
					<template v-if="$slots['summary-end']" #summary-end><slot name="summary-end" /></template>
				</RoadmapSummary>
			</header>
			<div v-if="data.stages.length && (hasFilter || hasLayoutSwitch)" class="base-roadmap__bar">
				<BaseSegmented
					v-if="hasLayoutSwitch"
					:ui="{ root: ui('layout') }"
					:model-value="layout"
					:options="layoutOptions"
					:aria-label="UI_ROADMAP.LAYOUT_LABEL"
					@update:model-value="setLayout" />
				<span v-if="hasLayoutSwitch && hasFilter" class="base-roadmap__bar-sep" aria-hidden="true" />
				<BaseSegmented
					v-if="hasFilter"
					:ui="{ root: ui('filter') }"
					:model-value="filter"
					:options="filterOptions"
					:aria-label="UI_ROADMAP.FILTER_LABEL"
					@update:model-value="setFilter" />
				<RoadmapLegend v-if="!isNarrow" :ui="ui" />
			</div>
			<div class="base-roadmap__body">
				<div class="base-roadmap__area" :class="`base-roadmap__area--${layout}`">
					<component
						:is="layoutComponent"
						v-if="data.stages.length"
						:stages="stageViews"
						:progress="pathProgress"
						:goal="goalText"
						:ui="ui"
						@toggle-stage="toggleStage"
						@select-topic="openTopic"
						@toggle-topic="toggleTopic">
						<template v-if="$slots.topic" #topic="slotProps"><slot name="topic" v-bind="slotProps" /></template>
						<template v-if="$slots['stage-header']" #stage-header="slotProps"
							><slot name="stage-header" v-bind="slotProps"
						/></template>
					</component>
					<slot v-else name="empty"><BaseEmpty :title="UI_ROADMAP.EMPTY" /></slot>
				</div>
				<aside v-if="isSidePanel && selected" class="base-roadmap__side" :aria-label="UI_ROADMAP.PANEL_LABEL">
					<RoadmapTopicPanel
						:view="selected.view"
						:stage="selected.stage"
						:done-subtopics="doneSubtopics"
						:requirements="requirements"
						:ui="ui"
						:is-disabled="isDisabled"
						:is-busy="isSelectedBusy"
						:has-next="hasNext"
						@toggle-subtopic="toggleSubtopic"
						@set-status="setStatus"
						@select="openRequirement"
						@next="openNext">
						<template v-if="$slots['topic-details']" #topic-details="slotProps"
							><slot name="topic-details" v-bind="slotProps"
						/></template>
						<template v-if="$slots.material" #material="slotProps"><slot name="material" v-bind="slotProps" /></template>
					</RoadmapTopicPanel>
				</aside>
			</div>
			<div v-if="isNarrow && summaryView.continueId" class="base-roadmap__cta">
				<BaseButton @click="continueLearning">
					<template #left><BaseIcon name="play" /></template>
					{{ continueText }}
				</BaseButton>
			</div>
			<BaseDrawer
				direction="bottom"
				:is-open="isSheetOpen"
				:title="selected?.view.topic.title"
				:aria-label="UI_ROADMAP.PANEL_LABEL"
				@update:is-open="onSheetUpdate">
				<RoadmapTopicPanel
					v-if="selected"
					is-sheet
					:view="selected.view"
					:stage="selected.stage"
					:done-subtopics="doneSubtopics"
					:requirements="requirements"
					:ui="ui"
					:is-disabled="isDisabled"
					:is-busy="isSelectedBusy"
					:has-next="hasNext"
					@toggle-subtopic="toggleSubtopic"
					@set-status="setStatus"
					@select="openRequirement"
					@next="openNext">
					<template v-if="$slots['topic-details']" #topic-details="slotProps"
						><slot name="topic-details" v-bind="slotProps"
					/></template>
					<template v-if="$slots.material" #material="slotProps"><slot name="material" v-bind="slotProps" /></template>
				</RoadmapTopicPanel>
			</BaseDrawer>
		</template>
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseRoadmap.style.scss'
import { UI_ROADMAP } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseEmpty } from '@components/BaseEmpty'
import { BaseButton } from '@components/BaseButton'
import { BaseDrawer } from '@components/BaseDrawer'
import RoadmapLegend from './parts/RoadmapLegend.vue'
import RoadmapSummary from './parts/RoadmapSummary.vue'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { useBaseRoadmap } from '../model/useBaseRoadmap'
import { BaseSegmented } from '@components/BaseSegmented'
import { kitDefaults } from '@composables/base/useDefaults'
import RoadmapTopicPanel from './parts/RoadmapTopicPanel.vue'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseRoadmapEmits, BaseRoadmapProps, BaseRoadmapSlots } from '../types/BaseRoadmap.types'

const props = withDefaults(
	defineProps<BaseRoadmapProps>(),
	kitDefaults('BaseRoadmap', {
		sizeScale: SIZE_SCALE_DEFAULT,
		storage: undefined,
		layout: 'path',
		narrowLayout: 'list',
		narrowWidth: 560,
		filter: 'all',
		hasSummary: true,
		hasFilter: true,
		hasLayoutSwitch: true,
		detailsPosition: 'auto',
	}),
)
const emit = defineEmits<BaseRoadmapEmits>()
defineSlots<BaseRoadmapSlots>()

const {
	sizeScaleStyle,
	variantClass,
	customColorStyle,
	classes,
	ui,
	rootRef,
	data,
	isNarrow,
	layout,
	layoutComponent,
	layoutOptions,
	hasLayoutSwitch,
	setLayout,
	filter,
	filterOptions,
	setFilter,
	stageViews,
	pathProgress,
	goalText,
	subtitle,
	summaryView,
	continueText,
	continueLearning,
	liveText,
	selected,
	isSheetOpen,
	isSidePanel,
	requirements,
	doneSubtopics,
	hasNext,
	isSelectedBusy,
	onDetailsKeydown,
	onSheetUpdate,
	openTopic,
	openNext,
	openRequirement,
	toggleStage,
	toggleTopic,
	toggleSubtopic,
	setStatus,
	expose,
} = useBaseRoadmap(props, emit)

defineExpose(expose)
</script>
