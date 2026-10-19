<template>
	<div
		v-for="item in canvas.groups"
		:key="item.id"
		:class="[
			canvas.ui('group'),
			`base-flow-map__group--${item.layout}`,
			`base-flow-map__group--header-${item.header}`,
			`base-flow-map__group--${item.border}`,
		]"
		:style="{
			transform: `translate(${item.rect.x}px, ${item.rect.y}px)`,
			width: `${item.rect.width}px`,
			height: `${item.rect.height}px`,
			zIndex: item.depth,
			'--flow-group-color': item.group.color,
		}"
		role="graphics-object"
		tabindex="-1"
		:aria-roledescription="item.kindLabel"
		:aria-label="item.group.label"
		data-flow-entity="group"
		:data-flow-id="item.id"
		@click="canvas.pick.pick({ entity: 'group', id: item.id }, $event)"
		@contextmenu="canvas.pick.menu({ entity: 'group', id: item.id }, $event)">
		<span :class="canvas.ui('label')">
			<button
				type="button"
				class="base-flow-map__toggle"
				:aria-expanded="true"
				:aria-label="item.collapseLabel"
				@click.stop="canvas.toggleGroup(item.id)">
				<BaseIcon name="chevron-down" />
			</button>
			<span class="base-flow-map__label-text"
				><slot name="group-label" :group="item.group">{{ item.group.label }}</slot></span
			>
		</span>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import type { FlowGroup } from '../../types/data/flowData.types'
import { useFlowCanvasContext } from '../../model/context/flowContext'

defineSlots<{ 'group-label'?: (props: { group: FlowGroup }) => unknown }>()

const canvas = useFlowCanvasContext()
</script>
