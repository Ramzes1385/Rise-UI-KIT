<template>
	<div
		v-if="children.length && wasExpanded"
		:class="[treeContext.ui('children'), { 'base-tree__children--open': isOpen }, treeContext.classes.value.children]"
		role="group"
		:aria-hidden="isExpanded ? undefined : true"
		:inert="isExpanded ? undefined : true">
		<div :class="treeContext.ui('children-inner')" role="none">
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
import '../styles/BaseTree.style.scss'
import BaseTreeNode from './BaseTreeNode.vue'
import { useBaseTreeChildren } from '../model/useBaseTreeChildren'
import type { BaseTreeChildrenProps, BaseTreeChildrenSlots } from '../types/BaseTreeChildren.types'

defineProps<BaseTreeChildrenProps>()
defineSlots<BaseTreeChildrenSlots>()

const { treeContext } = useBaseTreeChildren()
</script>
