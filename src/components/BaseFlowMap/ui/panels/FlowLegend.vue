<template>
	<section class="base-flow-map__legend" :aria-label="UI_FLOW_PANELS.LEGEND" :data-zoom="context.viewport.value.zoom" />
</template>

<script setup lang="ts">
import { UI_FLOW_PANELS } from '@/locales/messages'
import { useFlowMapContext } from '../../model/context/flowContext'

const context = useFlowMapContext()
</script>
