<template>
	<div
		v-if="children.length && wasExpanded"
		class="base-tree__children"
		:class="[{ 'base-tree__children--open': isExpanded }, treeContext.classes.value.children]"
		:style="isExpanded ? undefined : COLLAPSED_STYLE">
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
import type { BaseTreeChildrenProps, BaseTreeChildrenSlots } from '../model/BaseTreeChildren.types'
import '../styles/BaseTree.style.scss'

defineProps<BaseTreeChildrenProps>()
defineSlots<BaseTreeChildrenSlots>()

/**
 * Свёрнутая ветка остаётся в DOM (ленивый рендер + сворачивание через grid 0fr), поэтому её узлы
 * были бы доступны по Tab и скринридеру. visibility:hidden убирает их из порядка фокуса и дерева
 * доступности, не меняя раскладку (высота контейнера и так нулевая).
 */
const COLLAPSED_STYLE = { visibility: 'hidden' } as const

const treeContext = inject(TREE_CONTEXT_KEY, undefined)
/* istanbul ignore if -- defensive: BaseTreeChildren всегда рендерится внутри BaseTree, контекст предоставляется родителем */
if (!treeContext) {
	throw new Error('BaseTreeChildren: TreeContext not found. Ensure BaseTreeChildren is rendered inside BaseTree.')
}
</script>
