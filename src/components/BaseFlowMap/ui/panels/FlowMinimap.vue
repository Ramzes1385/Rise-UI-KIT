<template>
	<div
		v-if="isShown"
		ref="rootRef"
		class="base-flow-map__minimap"
		:class="{ 'base-flow-map__minimap--dragging': isDragging }"
		role="application"
		tabindex="0"
		:aria-label="label"
		:aria-describedby="hintId"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerUp"
		@pointercancel="onPointerUp"
		@keydown="onKeydown">
		<span :id="hintId" class="base-flow-map__minimap-hint">{{ hint }}</span>
		<svg
			class="base-flow-map__minimap-svg"
			:width="size.width"
			:height="size.height"
			:viewBox="`0 0 ${size.width} ${size.height}`"
			aria-hidden="true"
			focusable="false">
			<rect
				v-for="group in groups"
				:key="group.id"
				class="base-flow-map__minimap-group"
				:style="group.color ? { '--base-flow-map-minimap-tint': group.color } : undefined"
				:x="group.rect.x"
				:y="group.rect.y"
				:width="group.rect.width"
				:height="group.rect.height"
				rx="3" />
			<rect
				v-for="node in nodes"
				:key="node.id"
				class="base-flow-map__minimap-node"
				:class="node.status && `base-flow-map__minimap-node--${node.status}`"
				:x="node.rect.x"
				:y="node.rect.y"
				:width="node.rect.width"
				:height="node.rect.height"
				rx="1.5" />
			<rect
				class="base-flow-map__minimap-viewport"
				:x="viewportRect.x"
				:y="viewportRect.y"
				:width="viewportRect.width"
				:height="viewportRect.height"
				rx="5" />
		</svg>
	</div>
</template>

<script setup lang="ts">
import { useFlowMinimap } from '../../model/panels/useFlowMinimap'

const {
	rootRef,
	isShown,
	isDragging,
	size,
	groups,
	nodes,
	viewportRect,
	label,
	hint,
	hintId,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onKeydown,
} = useFlowMinimap()
</script>
