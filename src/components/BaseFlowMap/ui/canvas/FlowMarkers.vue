<template>
	<defs>
		<marker
			v-for="marker in canvas.markers"
			:id="`${canvas.uid}-${marker.id}`"
			:key="marker.id"
			:class="['base-flow-map__marker', marker.isFilled && 'base-flow-map__marker--filled']"
			viewBox="0 0 10 10"
			:refX="marker.refX"
			refY="5"
			markerWidth="7"
			markerHeight="7"
			orient="auto-start-reverse">
			<path v-for="path in marker.paths" :key="path" :d="path" />
		</marker>
	</defs>
</template>

<script setup lang="ts">
import { useFlowCanvasContext } from '../../model/context/flowContext'

const canvas = useFlowCanvasContext()
</script>
