<template>
	<!--
		Дерево по образцу APG Tree View: один узел в порядке Tab (roving tabindex), стрелки вверх и вниз — по видимым
		узлам, вправо — раскрыть или к первому ребёнку, влево — свернуть или к родителю, Home/End, `*` — раскрыть соседей,
		буквы — поиск по началу подписи, Enter — действие узла (ссылка, выбор, раскрытие), Space — выбор.
	-->
	<div
		ref="rootRef"
		class="base-tree"
		:class="[variantClass, { 'base-tree--arrow-right': arrowPosition === 'right', 'base-tree--virtual': isVirtual }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle, virtualStyle]"
		role="tree"
		:aria-label="ariaLabel"
		@keydown="handleKeydown">
		<!--
			Виртуальная прокрутка: плоский список видимых узлов, в DOM только видимые и запас. Узел в порядке Tab
			остаётся в DOM и вне видимой области; стрелки к неотрисованному узлу сначала прокручивают к нему
		-->
		<div v-if="isVirtual" class="base-tree__virtual" role="none" :style="{ height: `${totalSize}px` }">
			<div
				v-for="entry in virtualItems"
				:key="entry.key"
				:ref="element => measureElement(element, entry.index)"
				class="base-tree__row"
				role="none"
				:style="{ transform: `translateY(${entry.start}px)` }">
				<BaseTreeNode
					:node="visibleNodes[entry.index].node"
					:depth="visibleNodes[entry.index].depth"
					:set-size="visibleNodes[entry.index].setSize"
					:pos-in-set="visibleNodes[entry.index].posInSet"
					:size-scale="sizeScale"
					is-flat>
					<template #icon="slotProps"><slot name="icon" v-bind="slotProps" /></template>
					<template #arrow="slotProps"><slot name="arrow" v-bind="slotProps" /></template>
					<template #label="slotProps"><slot name="label" v-bind="slotProps" /></template>
					<template #actions="slotProps"><slot name="actions" v-bind="slotProps" /></template>
				</BaseTreeNode>
			</div>
		</div>
		<template v-else>
			<BaseTreeNode
				v-for="(node, index) in items"
				:key="node.id"
				:node="node"
				:depth="0"
				:set-size="items.length"
				:pos-in-set="index + 1"
				:size-scale="sizeScale">
				<template #icon="slotProps"><slot name="icon" v-bind="slotProps" /></template>
				<template #arrow="slotProps"><slot name="arrow" v-bind="slotProps" /></template>
				<template #label="slotProps"><slot name="label" v-bind="slotProps" /></template>
				<template #actions="slotProps"><slot name="actions" v-bind="slotProps" /></template>
			</BaseTreeNode>
		</template>
	</div>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/useDefaults'
import '../styles/BaseTree.style.scss'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import BaseTreeNode from './BaseTreeNode.vue'
import { useBaseTree } from '../model/useBaseTree'
import type { BaseTreeEmits, BaseTreeProps, BaseTreeSlots } from '../types/BaseTree.types'

const props = withDefaults(
	defineProps<BaseTreeProps>(),
	kitDefaults('BaseTree', {
		variant: DEFAULT_VARIANT,
		selectionMode: 'none',
		arrowPosition: 'left',
		sizeScale: SIZE_SCALE_DEFAULT,
		isDefaultExpandAll: false,
		isVirtual: false,
		height: 400,
		itemSize: 36,
	}),
)
const emit = defineEmits<BaseTreeEmits>()
defineSlots<BaseTreeSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	visibleNodes,
	rootRef,
	virtualStyle,
	virtualItems,
	totalSize,
	measureElement,
	handleKeydown,
} = useBaseTree(props, emit)
</script>
