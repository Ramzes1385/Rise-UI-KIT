<template>
	<section
		:class="[
			ui('root'),
			variantClass,
			classes.root,
			isCompact && 'base-flow-map--compact',
			isMorphing && 'base-flow-map--morph',
			isDisabled && 'base-flow-map--disabled',
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rootStyle]"
		role="region"
		:aria-roledescription="UI_FLOW_MAP.ROLE"
		:aria-label="label"
		:aria-busy="isLoading || undefined"
		:aria-disabled="isDisabled || undefined">
		<FlowHeader v-if="hasHeader" />
		<FlowLoadError v-if="isLoadFailed" @retry="retryLoad" />
		<div v-if="hasSearch && !isLoading && !error" class="base-flow-map__bar"><FlowSearch /></div>
		<div v-if="isLoading" class="base-flow-map__state" role="status" :aria-label="UI_FLOW_MAP.LOADING">
			<BaseSkeleton shape="rect" width="100%" height="100%" />
		</div>
		<div v-else-if="error" class="base-flow-map__state">
			<BaseResult status="error" :title="UI_FLOW_MAP.ERROR_TITLE" :description="error" is-live />
		</div>
		<div v-else class="base-flow-map__body">
			<FlowEditPalette v-if="isEditing" />
			<div :class="['base-flow-map__stage', ...editClasses]">
				<FlowEditToolbar v-if="isEditing" />
				<FlowCanvas :particles="particles">
					<template v-if="$slots.node" #node="slotProps"><slot name="node" v-bind="slotProps" /></template>
					<template v-if="$slots['edge-label']" #edge-label="slotProps"><slot name="edge-label" v-bind="slotProps" /></template>
					<template v-if="$slots['group-label']" #group-label="slotProps"
						><slot name="group-label" v-bind="slotProps"
					/></template>
					<template v-if="$slots.empty" #empty><slot name="empty" /></template>
				</FlowCanvas>
				<FlowLevelBar v-if="!isEmpty">
					<template v-if="$slots.level" #level="slotProps"><slot name="level" v-bind="slotProps" /></template>
				</FlowLevelBar>
				<FlowToolbar v-if="hasToolbar">
					<template v-if="$slots.toolbar" #toolbar="slotProps"><slot name="toolbar" v-bind="slotProps" /></template>
				</FlowToolbar>
				<FlowTooltip v-if="$slots.tooltip">
					<template #tooltip="slotProps"><slot name="tooltip" v-bind="slotProps" /></template>
				</FlowTooltip>
				<FlowMinimap v-if="hasMinimap && !isEmpty" />
				<FlowLegend v-if="hasLegend && !isEmpty">
					<template v-if="$slots.legend" #legend="slotProps"><slot name="legend" v-bind="slotProps" /></template>
				</FlowLegend>
				<FlowScenarioPanel v-if="hasScenario && isCompact && isScenarioLoaded" />
				<FlowReviewOverlay v-if="isReviewLoaded" />
				<FlowEditStatus v-if="isEditing" />
				<FlowEditOverlay v-if="isEditLoaded" />
			</div>
			<aside v-if="!isCompact" class="base-flow-map__side">
				<FlowScenarioPanel v-if="hasScenario && isScenarioLoaded">
					<template v-if="$slots['scenario-step']" #scenario-step="slotProps"
						><slot name="scenario-step" v-bind="slotProps"
					/></template>
				</FlowScenarioPanel>
				<FlowDetails v-if="hasDetails">
					<template v-if="$slots.details" #details="slotProps"><slot name="details" v-bind="slotProps" /></template>
				</FlowDetails>
				<FlowReviewPanel v-if="isReviewLoaded" />
				<FlowEditInspector v-if="isEditing">
					<template v-if="$slots['inspector-end']" #inspector-end="slotProps"
						><slot name="inspector-end" v-bind="slotProps"
					/></template>
				</FlowEditInspector>
			</aside>
			<template v-else>
				<FlowDetails v-if="hasDetails">
					<template v-if="$slots.details" #details="slotProps"><slot name="details" v-bind="slotProps" /></template>
				</FlowDetails>
				<FlowReviewPanel v-if="isReviewLoaded" />
				<FlowEditInspector v-if="isEditing">
					<template v-if="$slots['inspector-end']" #inspector-end="slotProps"
						><slot name="inspector-end" v-bind="slotProps"
					/></template>
				</FlowEditInspector>
			</template>
		</div>
		<FlowA11yList v-if="!isLoading && !error" />
		<FlowLiveRegion :text="announcement" />
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseFlowMap.style.scss'
import { defineAsyncComponent } from 'vue'
import FlowCanvas from './canvas/FlowCanvas.vue'
import FlowHeader from './chrome/FlowHeader.vue'
import FlowLegend from './panels/FlowLegend.vue'
import { UI_FLOW_MAP } from '@/locales/messages'
import FlowToolbar from './chrome/FlowToolbar.vue'
import FlowTooltip from './chrome/FlowTooltip.vue'
import FlowMinimap from './panels/FlowMinimap.vue'
import FlowA11yList from './chrome/FlowA11yList.vue'
import FlowLevelBar from './chrome/FlowLevelBar.vue'
import FlowLoadError from './chrome/FlowLoadError.vue'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { useBaseFlowMap } from '../model/useBaseFlowMap'
import FlowLiveRegion from './chrome/FlowLiveRegion.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFlowMapEmits, BaseFlowMapProps, BaseFlowMapSlots } from '../types/BaseFlowMap.types'
import {
	loadDetails,
	loadEditInspector,
	loadEditOverlay,
	loadEditPalette,
	loadEditStatus,
	loadEditToolbar,
	loadResult,
	loadReviewOverlay,
	loadReviewPanel,
	loadScenarioPanel,
	loadSearch,
} from './lazy/flowLazyLoaders'

const props = withDefaults(
	defineProps<BaseFlowMapProps>(),
	kitDefaults('BaseFlowMap', {
		sizeScale: SIZE_SCALE_DEFAULT,
		notations: undefined,
		plugins: undefined,
		mode: 'view',
		modes: undefined,
		panels: undefined,
		scenario: undefined,
		isAutoplay: false,
		isSemanticZoom: true,
		particles: 400,
		compactBreakpoint: 640,
		height: '560px',
		wheelZoom: 'ctrl',
		minZoom: 0.2,
		maxZoom: 3,
		isLoading: false,
		isDisabled: false,
	}),
)

const FlowDetails = defineAsyncComponent(loadDetails)
const FlowEditInspector = defineAsyncComponent(loadEditInspector)
const FlowEditOverlay = defineAsyncComponent(loadEditOverlay)
const FlowEditPalette = defineAsyncComponent(loadEditPalette)
const FlowEditStatus = defineAsyncComponent(loadEditStatus)
const FlowEditToolbar = defineAsyncComponent(loadEditToolbar)
const FlowReviewOverlay = defineAsyncComponent(loadReviewOverlay)
const FlowReviewPanel = defineAsyncComponent(loadReviewPanel)
const FlowScenarioPanel = defineAsyncComponent(loadScenarioPanel)
const BaseResult = defineAsyncComponent(loadResult)
const FlowSearch = defineAsyncComponent(loadSearch)

const emit = defineEmits<BaseFlowMapEmits>()

defineSlots<BaseFlowMapSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	ui,
	label,
	rootStyle,
	model,
	announcement,
	isCompact,
	isMorphing,
	hasHeader,
	hasToolbar,
	hasSearch,
	hasMinimap,
	hasLegend,
	hasScenario,
	hasDetails,
	isEmpty,
	editClasses,
	isEditLoaded,
	isEditing,
	isReviewLoaded,
	isScenarioLoaded,
	isLoadFailed,
	retryLoad,
} = useBaseFlowMap(props, emit)

defineExpose(model.controller)
</script>
