<template>
	<section
		ref="rootRef"
		:class="[
			ui('root'),
			variantClass,
			classes.root,
			{ 'base-roadmap-3d--compact': isCompact, 'base-roadmap-3d--disabled': isDisabled, 'base-roadmap-3d--panel': hasPanel },
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, { height }]"
		:role="shownView === '2d' ? undefined : 'region'"
		:aria-roledescription="shownView === '2d' ? undefined : UI_ROADMAP_3D.ROLE"
		:aria-label="shownView === '2d' ? undefined : label"
		:aria-busy="isLoading || undefined"
		:aria-disabled="isDisabled || undefined">
		<header :class="[ui('header'), classes.header]">
			<div class="base-roadmap-3d__heading">
				<h2 class="base-roadmap-3d__title">{{ model.data.value.title }}</h2>
				<p v-if="model.data.value.description" class="base-roadmap-3d__subtitle">{{ model.data.value.description }}</p>
			</div>
			<div class="base-roadmap-3d__tools">
				<div
					v-if="hasSummary && summary.total > 0"
					class="base-roadmap-3d__summary"
					role="group"
					:aria-label="UI_ROADMAP.SUMMARY_LABEL">
					<span class="base-roadmap-3d__summary-text">
						<b>{{ summary.doneText }}</b>
						<span>{{ summary.percentText }}</span>
						<span v-if="summary.leftText">{{ summary.leftText }}</span>
					</span>
					<BaseProgress :value="summary.percent" :max="100" :aria-label="UI_ROADMAP.SUMMARY_LABEL" />
				</div>
				<slot name="summary-end" />
				<BaseSegmented
					v-if="has2dToggle && isSupported !== false"
					:model-value="shownView"
					:options="viewOptions"
					:aria-label="UI_ROADMAP_3D.VIEW"
					@update:model-value="setView($event === '2d' ? '2d' : '3d')" />
				<BaseButton
					v-if="hasTour && shownView === '3d'"
					variant="outline"
					:class="ui('tour')"
					:aria-pressed="tour.isPlaying.value"
					:is-disabled="snapshotEmpty"
					@click="tour.toggle">
					<template #left><BaseIcon :name="tour.isPlaying.value ? 'pause' : 'play'" /></template>
					{{ tour.isPlaying.value ? UI_ROADMAP_3D.TOUR_STOP : UI_ROADMAP_3D.TOUR_START }}
				</BaseButton>
			</div>
		</header>
		<template v-if="shownView === '2d'">
			<p v-if="statusText" :class="ui('status')" role="status">{{ statusText }}</p>
			<TwoDRoadmap v-bind="twoD" class="base-roadmap-3d__map">
				<template v-if="$slots.topic" #topic="slotProps"><slot name="topic" v-bind="slotProps" /></template>
				<template v-if="$slots['topic-details']" #topic-details="slotProps"
					><slot name="topic-details" v-bind="slotProps"
				/></template>
				<template v-if="$slots['stage-header']" #stage-header="slotProps"><slot name="stage-header" v-bind="slotProps" /></template>
				<template v-if="$slots.material" #material="slotProps"><slot name="material" v-bind="slotProps" /></template>
				<template v-if="$slots['summary-end']" #summary-end><slot name="summary-end" /></template>
				<template v-if="$slots.empty" #empty><slot name="empty" /></template>
			</TwoDRoadmap>
		</template>
		<div v-else class="base-roadmap-3d__body">
			<div
				ref="viewportRef"
				:class="[ui('viewport'), classes.viewport]"
				tabindex="0"
				role="group"
				:aria-label="label"
				:aria-roledescription="UI_ROADMAP_3D.ROLE"
				:aria-describedby="`${hintId} ${hintId}-keys`"
				@keydown="onKeydown"
				@focusout="onFocusOut"
				@pointerdown="onPointerDown"
				@pointermove="onPointerMove"
				@pointerup="onPointerUp"
				@pointercancel="onPointerUp"
				@pointerleave="onPointerLeave"
				@click="onClick"
				@wheel="camera.wheelZoom">
				<canvas v-if="hasCanvas" ref="canvasRef" :class="[ui('canvas'), classes.canvas]" aria-hidden="true" />
				<div ref="labelsRef" class="base-roadmap-3d__tags" dir="ltr" aria-hidden="true">
					<div
						v-for="tag in tags"
						:key="tag.id"
						:data-label-id="tag.id"
						:data-status="tag.statusId"
						:class="[
							ui('tag'),
							classes.tag,
							`base-roadmap-3d__tag--${tag.kind}`,
							{
								'base-roadmap-3d__tag--current': tag.isCurrent,
								'base-roadmap-3d__tag--selected': tag.isSelected,
								'base-roadmap-3d__tag--focused': tag.isFocused,
								'base-roadmap-3d__tag--dim': tag.isDim,
							},
						]"
						:style="tag.color ? { '--roadmap-3d-tint': tag.color } : undefined">
						<template v-if="tag.kind === 'stage'">
							<span v-if="tag.isCurrent" class="base-roadmap-3d__tag-here">{{ UI_ROADMAP.STAGE_HERE }}</span>
							<span class="base-roadmap-3d__tag-number">{{ tag.index + 1 }}</span>
							<span class="base-roadmap-3d__tag-text">
								<b class="base-roadmap-3d__tag-name">{{ tag.text }}</b>
								<span class="base-roadmap-3d__tag-meta">{{ tag.meta }}</span>
							</span>
						</template>
						<template v-else-if="tag.kind === 'topic'">
							<span class="base-roadmap-3d__tag-dot" />
							<span class="base-roadmap-3d__tag-name">{{ tag.text }}</span>
						</template>
						<span v-else class="base-roadmap-3d__tag-name">{{ tag.text }}</span>
					</div>
				</div>
				<div v-if="status" :class="[ui('status'), `base-roadmap-3d__status--${status.kind}`]" aria-hidden="true">
					<span>{{ status.text }}</span>
				</div>
				<p :id="hintId" :class="ui('hint')">{{ UI_ROADMAP_3D.HINT }}</p>
				<span :id="`${hintId}-keys`" class="base-roadmap-3d__sr">{{ keyboardHint }}</span>
				<RoadmapToolbar
					:class-name="ui('toolbar')"
					:is-max="camera.isMaxZoom.value"
					:is-min="camera.isMinZoom.value"
					@click.stop
					@pointerdown.stop
					@rotate="camera.rotate"
					@zoom="$event > 0 ? camera.zoomIn() : camera.zoomOut()"
					@overview="focus.overview"
					@reset="camera.home" />
				<RoadmapTourBar
					v-if="tour.isPlaying.value"
					class-name="base-roadmap-3d__tour-bar"
					:caption="caption"
					:is-first="tour.step.value === 0"
					:is-last="tour.step.value >= tour.total.value - 1"
					@click.stop
					@pointerdown.stop
					@move="tour.move"
					@stop="tour.stop()" />
				<RoadmapStepper
					v-else
					:class-name="ui('stepper')"
					:steps="steps"
					:has-nav="isCompact"
					:is-first="nav.isFirst"
					:is-last="nav.isLast"
					@click.stop
					@pointerdown.stop
					@touchstart="onTouchStart"
					@touchmove="onTouchMove"
					@touchend="onTouchEnd"
					@select="focus.focusStage($event)"
					@go="focus.go" />
			</div>
			<RoadmapStagePanel
				v-if="panel.stage.value"
				:class-name="ui('panel')"
				:stage="panel.stage.value"
				:topic="panel.topic.value"
				:panel-ui="panelUi"
				:is-editing="isEditing"
				:is-compact="isCompact"
				:is-disabled="isDisabled"
				@close="panel.closePanel"
				@open-2d="setView('2d')"
				@go="focus.go"
				@select="panel.selectTopic"
				@next-topic="panel.openNextTopic"
				@toggle-subtopic="panel.toggleSubtopic"
				@set-status="panel.setStatus"
				@shift="edit.shift(panel.stage.value.item.id, $event)"
				@rename="edit.rename(panel.stage.value.item.id, $event)"
				@model="edit.setModel(panel.stage.value.item.id, $event === AUTO_MODEL ? {} : { model: $event })"
				@url="edit.setModel(panel.stage.value.item.id, { url: $event })"
				@add="edit.add"
				@remove="edit.remove(panel.stage.value.item.id)">
				<template v-if="$slots['topic-details']" #topic-details="slotProps"
					><slot name="topic-details" v-bind="slotProps"
				/></template>
				<template v-if="$slots.material" #material="slotProps"><slot name="material" v-bind="slotProps" /></template>
				<template v-if="$slots['stage-header']" #stage-header="slotProps"><slot name="stage-header" v-bind="slotProps" /></template>
			</RoadmapStagePanel>
		</div>
		<ol v-if="shownView === '3d' && listStages.length" class="base-roadmap-3d__list" :aria-label="UI_ROADMAP_3D.LIST">
			<li v-for="item in listStages" :key="item.id">
				<button type="button" tabindex="-1" @click="focus.focusStage(item.id)">{{ item.label }}</button>
				<ul>
					<li v-for="topic in item.topics" :key="topic.id">
						<button type="button" tabindex="-1" @click="panel.selectTopic(topic.id)">{{ topic.label }}</button>
					</li>
				</ul>
			</li>
		</ol>
		<p class="base-roadmap-3d__sr" role="status" aria-live="polite">{{ announcement }}</p>
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseRoadmap3D.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import RoadmapStepper from './parts/RoadmapStepper.vue'
import RoadmapToolbar from './parts/RoadmapToolbar.vue'
import RoadmapTourBar from './parts/RoadmapTourBar.vue'
import { BaseProgress } from '@components/BaseProgress'
import { BaseSegmented } from '@components/BaseSegmented'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseRoadmap3D } from '../model/useBaseRoadmap3D'
import RoadmapStagePanel from './parts/RoadmapStagePanel.vue'
import { UI_ROADMAP, UI_ROADMAP_3D } from '@/locales/messages'
import { AUTO_MODEL } from '../model/view/useRoadmapStagePanel'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseRoadmap3DEmits, BaseRoadmap3DProps, BaseRoadmap3DSlots } from '../types/BaseRoadmap3D.types'

const props = withDefaults(
	defineProps<BaseRoadmap3DProps>(),
	kitDefaults('BaseRoadmap3D', {
		sizeScale: SIZE_SCALE_DEFAULT,
		view: '3d',
		isTourPlaying: false,
		quality: 'auto',
		has2dToggle: true,
		hasTour: true,
		hasSummary: true,
		compactBreakpoint: 640,
		height: '560px',
		layout: 'path',
		detailsPosition: 'auto',
		narrowWidth: 640,
		isLoading: false,
		isDisabled: false,
	}),
)

const emit = defineEmits<BaseRoadmap3DEmits>()

defineSlots<BaseRoadmap3DSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	ui,
	panelUi,
	label,
	hintId,
	keyboardHint,
	isCompact,
	shownView,
	isSupported,
	status,
	statusText,
	hasCanvas,
	hasPanel,
	snapshotEmpty,
	viewOptions,
	nav,
	summary,
	caption,
	steps,
	tags,
	model,
	panel,
	edit,
	tour,
	focus,
	camera,
	twoD,
	listStages,
	announcement,
	isEditing,
	TwoDRoadmap,
	setView,
	onKeydown,
	onFocusOut,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onPointerLeave,
	onClick,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	expose,
} = useBaseRoadmap3D(props, emit)

defineExpose(expose)
</script>
