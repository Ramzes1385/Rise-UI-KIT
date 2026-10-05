<template>
	<div
		:class="[treeContext.ui('node'), nodeClasses, treeContext.classes.value.node]"
		:style="isFlat ? { '--base-tree-depth': depth } : undefined"
		role="none">
		<div
			:ref="setHeaderElement"
			:class="[treeContext.ui('header'), treeContext.classes.value.header]"
			role="treeitem"
			:tabindex="tabIndex"
			:aria-labelledby="labelId"
			:aria-level="depth + 1"
			:aria-setsize="setSize"
			:aria-posinset="posInSet"
			:aria-expanded="hasChildren ? isExpanded : undefined"
			:aria-selected="treeContext.selectionMode.value === 'single' && isSelected ? true : undefined"
			:aria-checked="ariaChecked"
			:aria-disabled="node.isDisabled ? 'true' : undefined"
			@click="handleHeaderClick"
			@focusin="treeContext.setActive(node.id)">
			<span
				v-if="treeContext.arrowPosition.value === 'left'"
				:class="[treeContext.ui('arrow'), { 'base-tree__arrow--expanded': isExpanded }, treeContext.classes.value.arrow]"
				aria-hidden="true"
				@click.stop="handleArrowClick">
				<slot name="arrow" :node="node" :is-expanded="isExpanded">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
				</slot>
			</span>
			<span v-if="treeContext.selectionMode.value === 'multiple'" class="base-tree__checkbox-wrap" aria-hidden="true" inert>
				<BaseCheckbox
					:class="treeContext.ui('checkbox')"
					:custom-class="checkboxClasses"
					:model-value="isSelected"
					:is-indeterminate="isIndeterminate"
					:label="node.label"
					:is-disabled="node.isDisabled"
					:size-scale="sizeScale" />
			</span>
			<slot name="icon" :node="node">
				<BaseIcon
					v-if="node.icon"
					:name="node.icon"
					:class="treeContext.ui('icon')"
					:custom-class="treeContext.classes.value.icon"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</slot>
			<span :id="labelId" :class="[treeContext.ui('label'), treeContext.classes.value.label]">
				<slot name="label" :node="node" :depth="depth" :is-selected="isSelected" :is-expanded="isExpanded">
					<BaseLink
						v-if="(node.to || node.href) && !node.isDisabled"
						:class="treeContext.ui('link')"
						variant="ghost"
						tabindex="-1"
						:to="node.to"
						:href="node.href"
						:target="node.target"
						@mousedown="handleLinkMousedown"
						@click="handleLinkClick">
						{{ node.label }}
					</BaseLink>
					<template v-else>{{ node.label }}</template>
				</slot>
			</span>
			<span
				v-if="treeContext.arrowPosition.value === 'right'"
				:class="[
					treeContext.ui('arrow'),
					'base-tree__arrow--right',
					{ 'base-tree__arrow--expanded': isExpanded },
					treeContext.classes.value.arrow,
				]"
				aria-hidden="true"
				@click.stop="handleArrowClick">
				<slot name="arrow" :node="node" :is-expanded="isExpanded">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
				</slot>
			</span>
			<div ref="actionsRef" :class="[treeContext.ui('actions'), treeContext.classes.value.actions]" @click.stop>
				<slot name="actions" :node="node" />
			</div>
		</div>
		<BaseTreeChildren
			v-if="hasChildren && !isFlat"
			:children="childNodes"
			:depth="depth + 1"
			:size-scale="sizeScale"
			:is-expanded="isExpanded"
			:was-expanded="wasExpanded"
			:is-open="isOpen">
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
import '../styles/BaseTree.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import BaseTreeChildren from './BaseTreeChildren.vue'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { useBaseTreeNode } from '../model/useBaseTreeNode'
import type { BaseTreeNodeProps, BaseTreeNodeSlots } from '../types/BaseTreeNode.types'

const props = defineProps<BaseTreeNodeProps>()
defineSlots<BaseTreeNodeSlots>()

const {
	treeContext,
	labelId,
	setHeaderElement,
	hasChildren,
	isExpanded,
	isSelected,
	isIndeterminate,
	ariaChecked,
	actionsRef,
	wasExpanded,
	isOpen,
	childNodes,
	tabIndex,
	nodeClasses,
	checkboxClasses,
	handleArrowClick,
	handleLinkMousedown,
	handleLinkClick,
	handleHeaderClick,
} = useBaseTreeNode(props)
</script>
