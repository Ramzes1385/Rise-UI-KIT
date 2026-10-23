<template>
	<g class="base-flow-map__scenario-layer" aria-hidden="true" :data-status="status">
		<path
			v-for="trail in marks.trails"
			:key="trail.id"
			class="base-flow-map__scenario-trail"
			:class="`base-flow-map__scenario-trail--${trail.state}`"
			:data-status="trail.status"
			:d="trail.path"
			pathLength="1"
			stroke-dasharray="1"
			:stroke-dashoffset="trail.offset" />
		<rect
			v-for="pulse in marks.pulses"
			:key="pulse.id"
			class="base-flow-map__scenario-pulse"
			:data-status="pulse.status"
			:x="pulse.rect.x"
			:y="pulse.rect.y"
			:width="pulse.rect.width"
			:height="pulse.rect.height" />
		<g ref="group" class="base-flow-map__particles" :class="{ 'base-flow-map__particles--muted': isMuted }">
			<circle v-for="index in count" :key="index" class="base-flow-map__particle" r="2.5" />
		</g>
		<g v-for="token in marks.tokens" :key="token.id" class="base-flow-map__scenario-token" :data-status="token.status">
			<circle class="base-flow-map__scenario-token-ring" :cx="token.x" :cy="token.y" r="9" />
			<circle class="base-flow-map__scenario-token-dot" :cx="token.x" :cy="token.y" r="4.5" />
		</g>
	</g>
</template>

<script setup lang="ts">
import { useFlowScenarioLayer } from '../../model/scenario/layer/useFlowScenarioLayer'
import type { FlowScenarioLayerProps } from '../../types/internal/flowScenarioLayer.types'

const props = withDefaults(defineProps<FlowScenarioLayerProps>(), { particles: 400 })

const { status, marks, group, count, isMuted } = useFlowScenarioLayer(() => props.particles)
</script>
