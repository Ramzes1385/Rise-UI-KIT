<template>
	<FlowInspector3DSection
		v-if="node"
		:node="node"
		:model-title="info.title"
		:model-key="info.key"
		:has-swap="false"
		:x="rect?.x ?? 0"
		:y="rect?.y ?? 0"
		@rotate="rotate"
		@tint="tint"
		@scale="scale"
		@elevation="elevation" />
</template>

<script setup lang="ts">
import FlowInspector3DSection from './FlowInspector3DSection.vue'
import { useFlowInspector3DSlot } from '../../model/edit/panels/useFlowInspector3DSlot'
import type { FlowInspector3DSlotProps } from '../../types/internal/flowMap3dEdit.types'

const props = defineProps<FlowInspector3DSlotProps>()

const { node, info, rect, rotate, tint, scale, elevation } = useFlowInspector3DSlot(props)
</script>
