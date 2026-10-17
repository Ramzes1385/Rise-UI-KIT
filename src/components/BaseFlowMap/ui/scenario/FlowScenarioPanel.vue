<template>
	<section
		class="base-flow-map__scenario-panel"
		:aria-label="UI_FLOW_SCENARIO.PANEL"
		:data-status="context.model.scenario.state.value.status" />
</template>

<script setup lang="ts">
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { useFlowMapContext } from '../../model/context/flowContext'

const context = useFlowMapContext()
</script>
