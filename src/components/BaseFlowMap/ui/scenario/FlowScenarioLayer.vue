<template>
	<g class="base-flow-map__scenario-layer" aria-hidden="true" :data-status="context.model.scenario.state.value.status" />
</template>

<script setup lang="ts">
import { useFlowMapContext } from '../../model/context/flowContext'

const context = useFlowMapContext()
</script>
