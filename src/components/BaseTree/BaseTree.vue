<template>
	<div
		class="base-tree"
		:class="[variantClass, { 'base-tree--arrow-right': arrowPosition === 'right' }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<BaseTreeNode v-for="node in items" :key="node.id" :node="node" :depth="0" :size-scale="sizeScale">
			<template #icon="slotProps"><slot name="icon" v-bind="slotProps" /></template>
			<template #arrow="slotProps"><slot name="arrow" v-bind="slotProps" /></template>
			<template #label="slotProps"><slot name="label" v-bind="slotProps" /></template>
			<template #actions="slotProps"><slot name="actions" v-bind="slotProps" /></template>
		</BaseTreeNode>
	</div>
</template>

<script setup lang="ts">
import type { BaseTreeEmits, BaseTreeProps } from './BaseTree.types'

import { computed, provide, toRef } from 'vue'

import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'

import './BaseTree.style.scss'
import { TREE_CONTEXT_KEY } from './BaseTree.types'
import BaseTreeNode from './BaseTreeNode.vue'
import { useTreeState } from './useTreeState'

const props = withDefaults(defineProps<BaseTreeProps>(), {
	selectionMode: 'none',
	arrowPosition: 'left',
	variant: 'default',
	sizeScale: 100,
	isDefaultExpandAll: false,
})

const emit = defineEmits<BaseTreeEmits>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-tree', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
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
	selectionMode: computed(function getSelectionMode() {
		return props.selectionMode
	}),
	arrowPosition: computed(function getArrowPosition() {
		return props.arrowPosition
	}),
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
