<template>
	<g
		:class="[
			canvas.ui('node'),
			'base-flow-map__node--svg',
			item.isSelected && 'base-flow-map__node--selected',
			item.isFocused && 'base-flow-map__node--focused',
			item.isHighlighted && 'base-flow-map__node--highlighted',
			item.isDim && 'base-flow-map__node--dim',
			item.isExternal && 'base-flow-map__node--external',
		]"
		:style="{
			'--flow-node-fill': item.kind.shape.fill,
			'--flow-node-stroke': item.node.color ?? item.kind.shape.stroke,
			'--flow-node-text': item.kind.shape.text,
		}"
		:transform="`translate(${item.rect.x} ${item.rect.y})`"
		role="graphics-object"
		:tabindex="item.tabIndex"
		:aria-roledescription="item.kindLabel"
		:aria-label="item.ariaLabel"
		:aria-current="item.isSelected || undefined"
		data-flow-entity="node"
		:data-flow-id="item.id"
		:data-status="item.status?.id"
		@click="canvas.pick.pick({ entity: 'node', id: item.id }, $event)"
		@dblclick="canvas.pick.open({ entity: 'node', id: item.id }, $event)"
		@contextmenu="canvas.pick.menu({ entity: 'node', id: item.id }, $event)"
		@pointerenter="canvas.pick.hover({ entity: 'node', id: item.id }, $event)"
		@pointerleave="canvas.pick.hover(null, $event)">
		<path class="base-flow-map__shape" :d="item.shape.path" />
		<path v-if="item.shape.inner" class="base-flow-map__shape-inner" :d="item.shape.inner" />
		<template v-for="marker in placeMarkers(item.kind.shape.markers?.(item.node) ?? [], item.rect)" :key="marker.key">
			<path
				v-if="marker.path"
				class="base-flow-map__shape-sign"
				:class="{ 'base-flow-map__shape-sign--filled': marker.isFilled }"
				:d="marker.path"
				:transform="`translate(${marker.x} ${marker.y}) scale(${marker.scale})`" />
			<text
				v-else
				class="base-flow-map__shape-text"
				:x="marker.x"
				:y="marker.y"
				:text-anchor="marker.anchor"
				dominant-baseline="central">
				{{ marker.text }}
			</text>
		</template>
		<text
			class="base-flow-map__node-label"
			:x="item.rect.width / 2"
			:y="item.kind.labelPlacement === 'below' ? item.rect.height + 16 : item.rect.height / 2"
			text-anchor="middle"
			dominant-baseline="central">
			{{ item.kind.labelPlacement === 'none' ? '' : item.node.label }}
		</text>
	</g>
</template>

<script setup lang="ts">
import { placeMarkers } from '../../model/render/shapes/shapeMarkers'
import { useFlowCanvasContext } from '../../model/context/flowContext'
import type { FlowNodeItem } from '../../types/internal/core/flowRenderInternal.types'

defineProps<{ item: FlowNodeItem }>()

const canvas = useFlowCanvasContext()
</script>
