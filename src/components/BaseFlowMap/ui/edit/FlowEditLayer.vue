<template>
	<g class="base-flow-map__edit-layer" aria-hidden="true" :data-mode="context.model.mode.value" />
</template>

<script setup lang="ts">
import { useFlowMapContext } from '../../model/context/flowContext'

const context = useFlowMapContext()
</script>
