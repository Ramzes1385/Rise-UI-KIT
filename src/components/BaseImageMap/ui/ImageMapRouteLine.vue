<template>
	<div class="base-image-map__route-layer" aria-hidden="true">
		<svg class="base-image-map__route-svg" :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none">
			<template v-for="line in lines" :key="line.id">
				<polyline class="base-image-map__route-casing" :points="line.points" vector-effect="non-scaling-stroke" />
				<polyline class="base-image-map__route-path" :points="line.points" vector-effect="non-scaling-stroke" />
			</template>
		</svg>
		<span
			v-for="marker in markers"
			:key="marker.id"
			class="base-image-map__route-marker"
			:class="`base-image-map__route-marker--${marker.kind}`"
			:style="marker.style" />
	</div>
</template>

<script setup lang="ts">
import type { ImageMapRouteLineProps } from '../types/ImageMapRoutes.types'

defineProps<ImageMapRouteLineProps>()
</script>
