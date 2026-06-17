<template>
	<div
		v-if="children.length && wasExpanded"
		class="base-tree__children"
		:class="[{ 'base-tree__children--open': isExpanded }, treeContext.classes.value.children]">
		<div class="base-tree__children-inner">
			<BaseTreeNode v-for="child in children" :key="child.id" :node="child" :depth="depth" :size-scale="sizeScale">
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
import { inject } from 'vue'
import { TREE_CONTEXT_KEY } from '../model/BaseTree.types'
import BaseTreeNode from './BaseTreeNode.vue'
import type { TreeNode } from '../model/BaseTree.types'
import type { VNode } from 'vue'
import '../styles/BaseTree.style.scss'

interface Props {
	children: TreeNode[]
	depth: number
	sizeScale: number
	isExpanded: boolean
	wasExpanded: boolean
}

interface Slots {
	icon?: (props: { node: TreeNode }) => VNode[]
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => VNode[]
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => VNode[]
	actions?: (props: { node: TreeNode }) => VNode[]
}

defineProps<Props>()
defineSlots<Slots>()

const treeContext = inject(TREE_CONTEXT_KEY, undefined)
/* istanbul ignore if -- defensive: BaseTreeChildren всегда рендерится внутри BaseTree, контекст предоставляется родителем */
if (!treeContext) {
	throw new Error('BaseTreeChildren: TreeContext not found. Ensure BaseTreeChildren is rendered inside BaseTree.')
}
</script>
