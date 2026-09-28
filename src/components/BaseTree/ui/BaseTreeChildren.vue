<template>
	<div
		v-if="children.length && wasExpanded"
		class="base-tree__children"
		:class="[{ 'base-tree__children--open': isExpanded }, treeContext.classes.value.children]"
		:style="isExpanded ? undefined : collapsedStyle"
		role="group">
		<div class="base-tree__children-inner" role="none">
			<BaseTreeNode
				v-for="(child, index) in children"
				:key="child.id"
				:node="child"
				:depth="depth"
				:set-size="children.length"
				:pos-in-set="index + 1"
				:size-scale="sizeScale">
				<template #icon="slotProps">
					<slot name="icon" :node="slotProps.node" />
				</template>
				<template #arrow="slotProps">
					<slot name="arrow" :node="slotProps.node" :is-expanded="slotProps.isExpanded" />
				</template>
				<template #label="slotProps">
					<slot
						name="label"
						:node="slotProps.node"
						:depth="slotProps.depth"
						:is-selected="slotProps.isSelected"
						:is-expanded="slotProps.isExpanded" />
				</template>
				<template #actions="slotProps">
					<slot name="actions" :node="slotProps.node" />
				</template>
			</BaseTreeNode>
		</div>
	</div>
</template>

<script setup lang="ts">
import BaseTreeNode from './BaseTreeNode.vue'
import { useBaseTreeChildren } from '../model/useBaseTreeChildren'
import type { BaseTreeChildrenProps, BaseTreeChildrenSlots } from '../types/BaseTreeChildren.types'
import '../styles/BaseTree.style.scss'

defineProps<BaseTreeChildrenProps>()
defineSlots<BaseTreeChildrenSlots>()

const { treeContext, collapsedStyle } = useBaseTreeChildren()
</script>
