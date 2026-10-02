<template>
	<div class="base-tree-select__panel" :class="classes.panel" :style="sizeScaleStyle">
		<div v-if="isSearchable" class="base-tree-select__search" :class="classes.search">
			<BaseIcon name="search" class="base-tree-select__search-icon" :size-scale="calcIconScale('sm', sizeScale)" />
			<input
				ref="searchRef"
				v-model="searchQuery"
				type="text"
				:placeholder="UI_TEXT.SEARCH_PLACEHOLDER"
				:aria-label="UI_ARIA.SEARCH"
				aria-autocomplete="list"
				:aria-controls="rows.length && !isLoading ? treeId : undefined"
				:aria-activedescendant="activeIndex >= 0 && !isLoading ? getRowId(activeIndex) : undefined"
				autocomplete="off"
				class="base-tree-select__search-input"
				:class="classes.searchInput"
				@click.stop
				@keydown="$emit('search-keydown', $event)" />
		</div>

		<div v-if="isLoading" class="base-tree-select__status" :class="classes.status" role="status">
			<BaseText tag="span" :size-scale="sizeScale">{{ UI_TEXT.LOADING }}</BaseText>
		</div>
		<div v-else-if="!rows.length" class="base-tree-select__status" :class="classes.status">
			<slot name="empty">
				<BaseText tag="span" :size-scale="sizeScale">{{ searchQuery ? UI_TEXT.NO_RESULTS : UI_TEXT.EMPTY }}</BaseText>
			</slot>
		</div>
		<ul
			v-else
			:id="treeId"
			ref="treeRef"
			class="base-tree-select__tree"
			:class="classes.tree"
			role="tree"
			:aria-labelledby="labelledby"
			:aria-label="labelledby ? undefined : treeLabel"
			:aria-multiselectable="isMultiple ? 'true' : undefined">
			<li
				v-for="(row, index) in rows"
				:id="getRowId(index)"
				:key="row.node.id"
				class="base-tree-select__node"
				:class="[
					{
						'base-tree-select__node--active': index === activeIndex,
						'base-tree-select__node--selected': selectedSet.has(row.node.id),
						'base-tree-select__node--disabled': row.node.isDisabled,
					},
					classes.node,
				]"
				:style="{ '--base-tree-select-depth': row.depth }"
				role="treeitem"
				:aria-level="row.depth + 1"
				:aria-setsize="row.setSize"
				:aria-posinset="row.posInSet"
				:aria-expanded="ariaExpanded(row)"
				:aria-selected="ariaSelected(row.node.id)"
				:aria-checked="ariaChecked(row.node.id)"
				:aria-disabled="row.node.isDisabled ? 'true' : undefined"
				@click="$emit('select', row)"
				@mousemove="index !== activeIndex && $emit('activate', index)">
				<span
					class="base-tree-select__toggle"
					:class="[
						{ 'base-tree-select__toggle--expanded': row.isExpanded, 'base-tree-select__toggle--leaf': !row.hasChildren },
						classes.toggle,
					]"
					aria-hidden="true"
					@click.stop="row.hasChildren ? $emit('toggle', row) : $emit('select', row)">
					<BaseIcon name="chevron-right" :size-scale="calcIconScale('sm', sizeScale)" />
				</span>
				<span
					v-if="isMultiple"
					class="base-tree-select__checkbox"
					:class="[{ 'base-tree-select__checkbox--mixed': indeterminateSet.has(row.node.id) }, classes.checkbox]"
					aria-hidden="true">
					<BaseIcon v-if="indeterminateSet.has(row.node.id)" name="minus" :size-scale="calcIconScale('xs', sizeScale)" />
					<BaseIcon v-else-if="selectedSet.has(row.node.id)" name="check" :size-scale="calcIconScale('xs', sizeScale)" />
				</span>
				<BaseIcon
					v-if="row.node.icon"
					:name="row.node.icon"
					class="base-tree-select__icon"
					:custom-class="classes.icon"
					:size-scale="calcIconScale('sm', sizeScale)" />
				<span class="base-tree-select__node-label" :class="classes.nodeLabel">
					<slot name="node" :node="row.node" :is-selected="selectedSet.has(row.node.id)" :depth="row.depth">{{
						row.node.label
					}}</slot>
				</span>
				<BaseIcon
					v-if="!isMultiple && selectedSet.has(row.node.id)"
					name="check"
					class="base-tree-select__check"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { UI_ARIA, UI_TEXT } from '@/locales/messages'
import { calcIconScale } from '@utils/media/iconUtils'
import { useBaseTreeSelectPanel } from '../model/useBaseTreeSelectPanel'
import type { BaseTreeSelectPanelEmits, BaseTreeSelectPanelProps, BaseTreeSelectPanelSlots } from '../types/BaseTreeSelectPanel.types'

const props = defineProps<BaseTreeSelectPanelProps>()

defineEmits<BaseTreeSelectPanelEmits>()

defineSlots<BaseTreeSelectPanelSlots>()

const searchQuery = defineModel<string>('searchQuery', { default: '' })

const { treeRef, searchRef, ariaChecked, ariaSelected, ariaExpanded } = useBaseTreeSelectPanel(props)
</script>
