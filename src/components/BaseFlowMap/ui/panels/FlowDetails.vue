<template>
	<BaseDrawer
		v-if="isCompact"
		:ui="{ panel: 'base-flow-map__sheet' }"
		direction="bottom"
		:is-open="isSheetOpen"
		:title="labels.title"
		has-handle
		is-draggable
		:has-overlay="false"
		close-on-escape
		@update:is-open="onSheetChange">
		<slot v-if="view && $slots.details" name="details" v-bind="slotProps" />
		<FlowDetailsBody v-else-if="view" :view="view" :labels="labels" />
		<div v-if="$slots['inspector-end'] && view && isEditing && target" class="base-flow-map__details-inspector">
			<slot name="inspector-end" :target="target" :controller="controller" />
		</div>
	</BaseDrawer>
	<section v-else-if="view" class="base-flow-map__details" :aria-label="labels.title" @keydown="onKeydown">
		<slot v-if="$slots.details" name="details" v-bind="slotProps" />
		<FlowDetailsBody v-else :view="view" :labels="labels" has-close @close="close" />
		<div v-if="$slots['inspector-end'] && isEditing && target" class="base-flow-map__details-inspector">
			<slot name="inspector-end" :target="target" :controller="controller" />
		</div>
	</section>
</template>

<script setup lang="ts">
import FlowDetailsBody from './FlowDetailsBody.vue'
import { BaseDrawer } from '@components/BaseDrawer'
import { useFlowDetails } from '../../model/panels/useFlowDetails'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import type { FlowEdge, FlowNode } from '../../types/data/flowData.types'
import type { FlowMapController } from '../../types/api/flowController.types'

defineSlots<{
	details?: (props: { target: FlowElementRef; node?: FlowNode; edge?: FlowEdge; close: () => void }) => unknown
	'inspector-end'?: (props: { target: FlowElementRef; controller: FlowMapController }) => unknown
}>()

const { view, isCompact, isSheetOpen, isEditing, target, controller, slotProps, labels, close, onKeydown, onSheetChange } = useFlowDetails()
</script>
