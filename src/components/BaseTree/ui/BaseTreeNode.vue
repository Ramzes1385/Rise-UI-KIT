<template>
	<div
		class="base-tree__node"
		:class="[nodeClasses, treeContext.classes.value.node]"
		:style="isFlat ? { '--base-tree-depth': depth } : undefined"
		role="none">
		<!-- Заголовок — treeitem: уровень, позиция, раскрытие и выбор; фокус и клавиши — у корня дерева -->
		<div
			:ref="setHeaderElement"
			class="base-tree__header"
			:class="treeContext.classes.value.header"
			role="treeitem"
			:tabindex="tabIndex"
			:aria-labelledby="labelId"
			:aria-level="depth + 1"
			:aria-setsize="setSize"
			:aria-posinset="posInSet"
			:aria-expanded="hasChildren ? isExpanded : undefined"
			:aria-selected="treeContext.selectionMode.value === 'single' && isSelected ? true : undefined"
			:aria-checked="treeContext.selectionMode.value === 'multiple' ? isSelected : undefined"
			:aria-disabled="node.isDisabled ? 'true' : undefined"
			@click="handleHeaderClick"
			@focus="treeContext.setActive(node.id)">
			<span
				v-if="treeContext.arrowPosition.value === 'left'"
				class="base-tree__arrow"
				:class="[{ 'base-tree__arrow--expanded': isExpanded }, treeContext.classes.value.arrow]"
				aria-hidden="true"
				@click.stop="handleArrowClick">
				<slot name="arrow" :node="node" :is-expanded="isExpanded">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
				</slot>
			</span>
			<!--
				Флажок — только вид: отметку объявляет aria-checked узла, клик по флажку — клик по узлу.
				inert убирает его из порядка Tab и дерева доступности, указатель проходит сквозь него к заголовку
			-->
			<span v-if="treeContext.selectionMode.value === 'multiple'" class="base-tree__checkbox-wrap" aria-hidden="true" inert>
				<BaseCheckbox
					class="base-tree__checkbox"
					:custom-class="checkboxClasses"
					:model-value="isSelected"
					:label="node.label"
					:is-disabled="node.isDisabled"
					:size-scale="sizeScale" />
			</span>
			<slot name="icon" :node="node">
				<BaseIcon
					v-if="node.icon"
					:name="node.icon"
					class="base-tree__icon"
					:custom-class="treeContext.classes.value.icon"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</slot>
			<!-- Имя узла — только подпись: кнопки слота actions в имя не попадают -->
			<span :id="labelId" class="base-tree__label" :class="treeContext.classes.value.label">
				<slot name="label" :node="node" :depth="depth" :is-selected="isSelected" :is-expanded="isExpanded">
					<!-- Узел с адресом — ссылка (BaseLink): клик и Enter переходят по ней, фокус остаётся у узла -->
					<BaseLink
						v-if="(node.to || node.href) && !node.isDisabled"
						class="base-tree__link"
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
				class="base-tree__arrow base-tree__arrow--right"
				:class="[{ 'base-tree__arrow--expanded': isExpanded }, treeContext.classes.value.arrow]"
				aria-hidden="true"
				@click.stop="handleArrowClick">
				<slot name="arrow" :node="node" :is-expanded="isExpanded">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
				</slot>
			</span>
			<div class="base-tree__actions" :class="treeContext.classes.value.actions">
				<slot name="actions" :node="node" />
			</div>
		</div>
		<BaseTreeChildren
			v-if="hasChildren && !isFlat"
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
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { calcIconScale } from '@utils/iconUtils'
import { BaseCheckbox } from '@components/BaseCheckbox'
import BaseTreeChildren from './BaseTreeChildren.vue'
import { useBaseTreeNode } from '../model/useBaseTreeNode'
import type { BaseTreeNodeProps, BaseTreeNodeSlots } from '../types/BaseTreeNode.types'
import '../styles/BaseTree.style.scss'

const props = defineProps<BaseTreeNodeProps>()
defineSlots<BaseTreeNodeSlots>()

const {
	treeContext,
	labelId,
	setHeaderElement,
	hasChildren,
	isExpanded,
	isSelected,
	wasExpanded,
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
