<template>
	<g
		v-for="item in canvas.edges"
		:key="item.id"
		:class="[
			canvas.ui('edge'),
			`base-flow-map__edge--${item.kind.stroke}`,
			item.isSelected && 'base-flow-map__edge--selected',
			item.isHighlighted && 'base-flow-map__edge--highlighted',
			item.isDim && 'base-flow-map__edge--dim',
		]"
		:style="{ '--flow-edge-color': item.color }"
		role="graphics-symbol"
		:tabindex="item.tabIndex"
		:aria-label="item.ariaLabel"
		data-flow-entity="edge"
		:data-flow-id="item.id"
		:data-status="item.status?.id"
		@click="canvas.pick.pick({ entity: 'edge', id: item.id }, $event)"
		@dblclick="canvas.pick.open({ entity: 'edge', id: item.id }, $event)"
		@contextmenu="canvas.pick.menu({ entity: 'edge', id: item.id }, $event)"
		@pointerenter="canvas.pick.hover({ entity: 'edge', id: item.id }, $event)"
		@pointerleave="canvas.pick.hover(null, $event)">
		<path class="base-flow-map__edge-hit" :d="item.route.path" />
		<path
			class="base-flow-map__edge-line"
			:d="item.route.path"
			:marker-start="item.markerStart ? `url(#${canvas.uid}-${item.markerStart})` : undefined"
			:marker-end="item.markerEnd ? `url(#${canvas.uid}-${item.markerEnd})` : undefined" />
	</g>
</template>

<script setup lang="ts">
import { useFlowCanvasContext } from '../../model/context/flowContext'

const canvas = useFlowCanvasContext()
</script>
