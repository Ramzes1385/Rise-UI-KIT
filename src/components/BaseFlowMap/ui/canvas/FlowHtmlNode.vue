<template>
	<div
		:class="[
			canvas.ui('node'),
			item.isCompact && 'base-flow-map__node--tile',
			item.isLabelBottom && 'base-flow-map__node--label-bottom',
			item.node.appearance === 'compact' && 'base-flow-map__node--compact',
			item.isSelected && 'base-flow-map__node--selected',
			item.isFocused && 'base-flow-map__node--focused',
			item.isHighlighted && 'base-flow-map__node--highlighted',
			item.isDim && 'base-flow-map__node--dim',
			item.isExternal && 'base-flow-map__node--external',
		]"
		:style="{
			transform: `translate(${item.rect.x}px, ${item.rect.y}px)`,
			width: `${item.rect.width}px`,
			height: `${item.rect.height}px`,
			'--flow-node-fill': item.kind.shape.fill,
			'--flow-node-stroke': item.node.color ?? item.kind.shape.stroke,
			'--flow-node-text': item.kind.shape.text,
		}"
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
		<slot
			:node="item.node"
			:kind="item.kind"
			:status="item.status?.id"
			:metrics="item.metrics"
			:is-selected="item.isSelected"
			:is-focused="item.isFocused"
			:is-active="item.isHighlighted"
			:zoom="canvas.zoom">
			<span class="base-flow-map__node-icon" aria-hidden="true">
				<svg v-if="item.glyph" viewBox="0 0 16 16" width="18" height="18"><path :d="item.glyph" /></svg>
				<BaseIcon v-else-if="item.icon" :name="item.icon" />
			</span>
			<span class="base-flow-map__node-text">
				<span class="base-flow-map__node-label">{{ item.node.label }}</span>
				<span v-if="item.subtitle && !item.isCompact" class="base-flow-map__node-subtitle">{{ item.subtitle }}</span>
			</span>
			<button
				v-if="item.expandLabel"
				type="button"
				class="base-flow-map__toggle"
				:aria-expanded="false"
				:aria-label="item.expandLabel"
				@click.stop="canvas.toggleGroup(item.id)">
				<BaseIcon name="chevron-right" />
			</button>
			<span
				v-if="item.status"
				class="base-flow-map__node-status"
				:style="{ '--flow-status-color': item.status.color }"
				aria-hidden="true" />
		</slot>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { useFlowCanvasContext } from '../../model/context/flowContext'
import type { FlowNodeSlotProps } from '../../types/BaseFlowMap.types'
import type { FlowNodeItem } from '../../types/internal/core/flowRenderInternal.types'

defineProps<{ item: FlowNodeItem }>()

defineSlots<{ default?: (props: FlowNodeSlotProps) => unknown }>()

const canvas = useFlowCanvasContext()
</script>
