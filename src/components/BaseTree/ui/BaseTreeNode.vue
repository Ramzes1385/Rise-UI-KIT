<template>
	<div class="base-tree__node" :class="[nodeClasses, treeContext.classes.value.node]">
		<div
			class="base-tree__header"
			:class="treeContext.classes.value.header"
			tabindex="0"
			@click="handleHeaderClick"
			@keydown.enter="handleHeaderClick">
			<span
				v-if="treeContext.arrowPosition.value === 'left'"
				class="base-tree__arrow"
				:class="[{ 'base-tree__arrow--expanded': isExpanded }, treeContext.classes.value.arrow]"
				@click.stop="handleArrowClick">
				<slot name="arrow" :node="node" :is-expanded="isExpanded">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('xs', sizeScale)" />
				</slot>
			</span>
			<BaseCheckbox
				v-if="treeContext.selectionMode.value === 'multiple'"
				class="base-tree__checkbox"
				:custom-class="treeContext.classes.value.checkbox"
				:model-value="isSelected"
				:size-scale="sizeScale"
				@click.stop
				@update:model-value="handleCheckboxChange" />
			<slot name="icon" :node="node">
				<BaseIcon
					v-if="node.icon"
					:name="node.icon"
					class="base-tree__icon"
					:custom-class="treeContext.classes.value.icon"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</slot>
			<BaseText tag="span" :size-scale="sizeScale" class="base-tree__label" :class="treeContext.classes.value.label">
				<slot name="label" :node="node" :depth="depth" :is-selected="isSelected" :is-expanded="isExpanded">
					{{ node.label }}
				</slot>
			</BaseText>
			<span
				v-if="treeContext.arrowPosition.value === 'right'"
				class="base-tree__arrow base-tree__arrow--right"
				:class="[{ 'base-tree__arrow--expanded': isExpanded }, treeContext.classes.value.arrow]"
				@click.stop="handleArrowClick">
				<slot name="arrow" :node="node" :is-expanded="isExpanded">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('xs', sizeScale)" />
				</slot>
			</span>
			<div class="base-tree__actions" :class="treeContext.classes.value.actions">
				<slot name="actions" :node="node" />
			</div>
		</div>
		<BaseTreeChildren
			v-if="hasChildren"
			:children="childNodes"
			:depth="depth + 1"
			:size-scale="sizeScale"
			:is-expanded="isExpanded"
			:was-expanded="wasExpanded">
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
		</BaseTreeChildren>
	</div>
</template>

<script setup lang="ts">
import type { VNode } from 'vue'
import type { TreeContext, TreeNode } from '../model/BaseTree.types'

import { computed, inject, ref, watch } from 'vue'

import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import BaseTreeChildren from './BaseTreeChildren.vue'

import { TREE_CONTEXT_KEY } from '../model/BaseTree.types'

import '../styles/BaseTree.style.scss'

interface Props {
	node: TreeNode
	depth: number
	sizeScale: number
}

interface TreeNodeSlots {
	icon?: (props: { node: TreeNode }) => VNode[]
	arrow?: (props: { node: TreeNode; isExpanded: boolean }) => VNode[]
	label?: (props: { node: TreeNode; depth: number; isSelected: boolean; isExpanded: boolean }) => VNode[]
	actions?: (props: { node: TreeNode }) => VNode[]
}

const props = defineProps<Props>()
defineSlots<TreeNodeSlots>()

const treeContext = getTreeContext()

function getTreeContext(): TreeContext {
	const context = inject(TREE_CONTEXT_KEY, undefined)
	/* istanbul ignore if -- defensive: BaseTreeNode всегда рендерится внутри BaseTree, контекст предоставляется родителем */
	if (!context) {
		throw new Error('Контекст дерева не найден')
	}
	return context
}

const hasChildren = computed(function getHasChildren() {
	return Boolean(props.node.children?.length)
})

/** Дочерние узлы для рендера — рендерится только при hasChildren, поэтому всегда непустой. */
const childNodes = computed(function getChildNodes() {
	/* istanbul ignore next -- defensive: childNodes читается только при hasChildren=true */
	return props.node.children ?? []
})

const isExpanded = computed(function getIsExpanded() {
	return treeContext.expandedSet.value.has(props.node.id)
})

const isSelected = computed(function getIsSelected() {
	return treeContext.selectedSet.value.has(props.node.id)
})

/** Узел был раскрыт хотя бы раз — для ленивого рендеринга детей */
const wasExpanded = ref(isExpanded.value)

/** Запомнить что узел раскрывался */
watch(isExpanded, function handleExpandedWatch(expanded) {
	if (expanded && !wasExpanded.value) {
		wasExpanded.value = true
	}
})

const nodeClasses = computed(function getNodeClasses() {
	return {
		'base-tree__node--expanded': isExpanded.value,
		'base-tree__node--selected': isSelected.value,
		'base-tree__node--disabled': props.node.isDisabled,
		'base-tree__node--leaf': !hasChildren.value,
	}
})

/** Клик по стрелке — только раскрытие/скрытие */
function handleArrowClick(): void {
	if (props.node.isDisabled) {
		return
	}
	treeContext.toggleNode(props.node.id)
}

/** Клик по заголовку узла */
function handleHeaderClick(): void {
	if (props.node.isDisabled) {
		return
	}
	const mode = treeContext.selectionMode.value

	if (mode === 'none') {
		if (hasChildren.value) {
			treeContext.toggleNode(props.node.id)
		}
		return
	}

	treeContext.selectNode(props.node.id)
}

/** Клик по чекбоксу */
function handleCheckboxChange(): void {
	if (props.node.isDisabled) {
		return
	}
	treeContext.selectNode(props.node.id)
}
</script>
