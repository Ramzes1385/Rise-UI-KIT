<template>
	<section
		:class="[ui('root'), variantClass, classes.root, isCompact && 'base-flow-map--compact', isDisabled && 'base-flow-map--disabled']"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, rootStyle]"
		role="region"
		:aria-roledescription="UI_FLOW_MAP.ROLE"
		:aria-label="label"
		:aria-busy="isLoading || undefined"
		:aria-disabled="isDisabled || undefined">
		<FlowHeader v-if="hasHeader" />
		<div v-if="hasSearch && !isLoading && !error" class="base-flow-map__bar"><FlowSearch /></div>
		<div v-if="isLoading" class="base-flow-map__state" role="status" :aria-label="UI_FLOW_MAP.LOADING">
			<BaseSkeleton shape="rect" width="100%" height="100%" />
		</div>
		<div v-else-if="error" class="base-flow-map__state">
			<BaseResult status="error" :title="UI_FLOW_MAP.ERROR_TITLE" :description="error" is-live />
		</div>
		<div v-else class="base-flow-map__body">
			<div class="base-flow-map__stage">
				<FlowCanvas>
					<template v-if="$slots.node" #node="slotProps"><slot name="node" v-bind="slotProps" /></template>
					<template v-if="$slots['edge-label']" #edge-label="slotProps"><slot name="edge-label" v-bind="slotProps" /></template>
					<template v-if="$slots['group-label']" #group-label="slotProps"
						><slot name="group-label" v-bind="slotProps"
					/></template>
					<template v-if="$slots.empty" #empty><slot name="empty" /></template>
				</FlowCanvas>
				<FlowToolbar v-if="hasToolbar">
					<template v-if="$slots.toolbar" #toolbar="slotProps"><slot name="toolbar" v-bind="slotProps" /></template>
				</FlowToolbar>
				<FlowMinimap v-if="hasMinimap && !isEmpty" />
				<FlowLegend v-if="hasLegend && !isEmpty" />
				<FlowScenarioPanel v-if="hasScenario && isCompact" />
			</div>
			<aside v-if="!isCompact" class="base-flow-map__side">
				<FlowScenarioPanel v-if="hasScenario" />
				<FlowDetails v-if="hasDetails" />
			</aside>
			<FlowDetails v-else-if="hasDetails" />
		</div>
		<FlowA11yList v-if="!isLoading && !error" />
		<FlowLiveRegion :text="announcement" />
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseFlowMap.style.scss'
import FlowCanvas from './canvas/FlowCanvas.vue'
import FlowHeader from './chrome/FlowHeader.vue'
import FlowSearch from './chrome/FlowSearch.vue'
import FlowLegend from './panels/FlowLegend.vue'
import { UI_FLOW_MAP } from '@/locales/messages'
import FlowToolbar from './chrome/FlowToolbar.vue'
import FlowDetails from './panels/FlowDetails.vue'
import FlowMinimap from './panels/FlowMinimap.vue'
import { BaseResult } from '@components/BaseResult'
import FlowA11yList from './chrome/FlowA11yList.vue'
import { BaseSkeleton } from '@components/BaseSkeleton'
import { useBaseFlowMap } from '../model/useBaseFlowMap'
import FlowLiveRegion from './chrome/FlowLiveRegion.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import FlowScenarioPanel from './scenario/FlowScenarioPanel.vue'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFlowMapEmits, BaseFlowMapProps, BaseFlowMapSlots } from '../types/BaseFlowMap.types'

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
	hasHeader,
	hasToolbar,
	hasSearch,
	hasMinimap,
	hasLegend,
	hasScenario,
	hasDetails,
	isEmpty,
} = useBaseFlowMap(props, emit)

defineExpose(model.controller)
</script>
