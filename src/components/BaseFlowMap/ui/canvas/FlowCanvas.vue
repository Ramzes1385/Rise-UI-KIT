<template>
	<div
		:ref="canvas.attach"
		:class="[canvas.ui('viewport'), canvas.isAnimating && 'base-flow-map__viewport--animating']"
		v-bind="canvas.gestures"
		dir="ltr"
		role="graphics-document"
		:aria-label="canvas.label"
		:aria-describedby="`${canvas.uid}-hint`"
		@keydown="canvas.focus.onKeydown"
		@focusin="canvas.focus.onFocusin"
		@focusout="canvas.focus.onFocusout"
		@pointerleave="canvas.pick.hover(null, $event)">
		<span :id="`${canvas.uid}-hint`" class="base-flow-map__sr">{{ UI_FLOW_MAP.KEYBOARD_HINT }}</span>
		<div
			:class="canvas.ui('canvas')"
			:style="[canvas.sceneStyle, { width: `${canvas.size.width}px`, height: `${canvas.size.height}px` }]">
			<FlowGroups>
				<template v-if="$slots['group-label']" #group-label="slotProps"><slot name="group-label" v-bind="slotProps" /></template>
			</FlowGroups>
			<svg class="base-flow-map__svg" :width="canvas.size.width" :height="canvas.size.height">
				<FlowMarkers />
				<FlowEdges />
				<FlowSvgNode v-for="item in canvas.svgNodes" :key="item.id" :item="item" />
				<FlowEdgeLabels>
					<template v-if="$slots['edge-label']" #edge-label="slotProps"><slot name="edge-label" v-bind="slotProps" /></template>
				</FlowEdgeLabels>
				<FlowScenarioLayer />
				<FlowEditLayer />
				<FlowReviewLayer />
			</svg>
			<FlowHtmlNode v-for="item in canvas.htmlNodes" :key="item.id" :item="item">
				<template v-if="$slots.node" #default="slotProps"><slot name="node" v-bind="slotProps" /></template>
			</FlowHtmlNode>
		</div>
		<p v-if="canvas.hint" class="base-flow-map__hint" role="status">{{ UI_FLOW_MAP.WHEEL_HINT }}</p>
		<div v-if="chrome.isEmpty" class="base-flow-map__empty">
			<slot name="empty">{{ UI_FLOW_MAP.EMPTY }}</slot>
		</div>
	</div>
</template>

<script setup lang="ts">
import FlowEdges from './FlowEdges.vue'
import FlowGroups from './FlowGroups.vue'
import FlowMarkers from './FlowMarkers.vue'
import FlowSvgNode from './FlowSvgNode.vue'
import FlowHtmlNode from './FlowHtmlNode.vue'
import { UI_FLOW_MAP } from '@/locales/messages'
import FlowEdgeLabels from './FlowEdgeLabels.vue'
import FlowEditLayer from '../edit/FlowEditLayer.vue'
import FlowReviewLayer from '../review/FlowReviewLayer.vue'
import FlowScenarioLayer from '../scenario/FlowScenarioLayer.vue'
import type { BaseFlowMapSlots } from '../../types/BaseFlowMap.types'
import { useFlowCanvasContext, useFlowChromeContext } from '../../model/context/flowContext'

defineSlots<Pick<BaseFlowMapSlots, 'node' | 'edge-label' | 'group-label' | 'empty'>>()

const canvas = useFlowCanvasContext()
const chrome = useFlowChromeContext()
</script>
