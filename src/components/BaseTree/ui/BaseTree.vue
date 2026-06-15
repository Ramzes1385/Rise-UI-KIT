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
import type { BaseTreeEmits, BaseTreeProps } from '../model/BaseTree.types'

import { computed, provide, toRef } from 'vue'

import { useBaseComponent } from '@composables/useBaseComponent'

import '../styles/BaseTree.style.scss'
import { TREE_CONTEXT_KEY } from '../model/BaseTree.types'
import BaseTreeNode from './BaseTreeNode.vue'
import { useTreeState } from '../model/useTreeState'

const props = defineProps<BaseTreeProps>()

const selectionMode = computed(() => props.selectionMode ?? 'none')
const arrowPosition = computed(() => props.arrowPosition ?? 'left')
const sizeScale = computed(() => props.sizeScale ?? 100)
const isDefaultExpandAll = computed(() => props.isDefaultExpandAll ?? false)

const emit = defineEmits<BaseTreeEmits>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-tree',
	getVariant: () => props.variant,
	getSizeScale: () => sizeScale.value,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'node', 'header', 'arrow', 'checkbox', 'icon', 'label', 'actions', 'children'],
})

const { expandedIds, selectedIds, expandedSet, selectedSet, toggleNode, selectNode } = useTreeState({
	items: toRef(props, 'items'),
	selectionMode,
	expandedIds: toRef(props, 'expandedIds'),
	selectedIds: toRef(props, 'selectedIds'),
	isDefaultExpandAll,
	emit,
})

provide(TREE_CONTEXT_KEY, {
	selectionMode: computed(function getSelectionMode() {
		return selectionMode.value
	}),
	arrowPosition: computed(function getArrowPosition() {
		return arrowPosition.value
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
