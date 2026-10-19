<template>
	<div v-if="isShown" class="base-flow-map__tooltip" role="tooltip" :style="style"><slot name="tooltip" v-bind="props" /></div>
</template>

<script setup lang="ts">
import { useFlowTooltip } from '../../model/chrome/useFlowTooltip'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import type { FlowEdge, FlowNode } from '../../types/data/flowData.types'

defineSlots<{ tooltip?: (props: { target: FlowElementRef; node?: FlowNode; edge?: FlowEdge }) => unknown }>()

const { isShown, style, props } = useFlowTooltip()
</script>
