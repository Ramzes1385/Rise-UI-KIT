<template>
	<foreignObject
		v-for="item in canvas.labels"
		:key="item.id"
		:class="[canvas.ui('label'), 'base-flow-map__edge-label', item.isDim && 'base-flow-map__edge-label--dim']"
		:x="item.point.x - 80"
		:y="item.point.y - 12"
		width="160"
		height="24">
		<div class="base-flow-map__edge-label-text" :class="item.isHighlighted && 'base-flow-map__edge-label-text--highlighted'">
			<slot name="edge-label" :edge="item.edge" :is-active="item.isHighlighted">{{ item.text }}</slot>
		</div>
	</foreignObject>
</template>

<script setup lang="ts">
import type { FlowEdge } from '../../types/data/flowData.types'
import { useFlowCanvasContext } from '../../model/context/flowContext'

defineSlots<{ 'edge-label'?: (props: { edge: FlowEdge; isActive: boolean }) => unknown }>()

const canvas = useFlowCanvasContext()
</script>
