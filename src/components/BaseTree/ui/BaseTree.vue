<template>
	<div
		class="base-tree"
		:class="[variantClass, { 'base-tree--arrow-right': props.arrowPosition === 'right' }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseTreeNode v-for="node in items" :key="node.id" :node="node" :depth="0" :size-scale="props.sizeScale">
			<template #icon="slotProps"><slot name="icon" v-bind="slotProps" /></template>
			<template #arrow="slotProps"><slot name="arrow" v-bind="slotProps" /></template>
			<template #label="slotProps"><slot name="label" v-bind="slotProps" /></template>
			<template #actions="slotProps"><slot name="actions" v-bind="slotProps" /></template>
		</BaseTreeNode>
	</div>
</template>

<script setup lang="ts">
import type { BaseTreeEmits, BaseTreeProps } from '../model/BaseTree.types'

import { computed, provide, toRef } from 'vue'

import { useBaseComponent } from '@composables/useBaseComponent'

import '../styles/BaseTree.style.scss'
import { TREE_CONTEXT_KEY } from '../model/BaseTree.types'
import BaseTreeNode from './BaseTreeNode.vue'
import { useTreeState } from '../model/useTreeState'
import { SIZE_SCALE_DEFAULT } from '@constants'

const props = withDefaults(defineProps<BaseTreeProps>(), {
	selectionMode: 'none',
	arrowPosition: 'left',
	sizeScale: SIZE_SCALE_DEFAULT,
	isDefaultExpandAll: false,
})

const emit = defineEmits<BaseTreeEmits>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-tree',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'node', 'header', 'arrow', 'checkbox', 'icon', 'label', 'actions', 'children'],
})

const { expandedIds, selectedIds, expandedSet, selectedSet, toggleNode, selectNode } = useTreeState({
	items: toRef(props, 'items'),
	selectionMode: toRef(props, 'selectionMode'),
	expandedIds: toRef(props, 'expandedIds'),
	selectedIds: toRef(props, 'selectedIds'),
	isDefaultExpandAll: toRef(props, 'isDefaultExpandAll'),
	emit,
})

provide(TREE_CONTEXT_KEY, {
	selectionMode: toRef(props, 'selectionMode'),
	arrowPosition: toRef(props, 'arrowPosition'),
	expandedIds,
	selectedIds,
	expandedSet,
	selectedSet,
	toggleNode,
	selectNode,
	classes: computed(function getClasses() {
		return classes.value
	}),
})
</script>
