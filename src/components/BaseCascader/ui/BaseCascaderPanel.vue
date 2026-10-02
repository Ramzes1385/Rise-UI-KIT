<template>
	<div class="base-cascader__panel" :class="classes.panel" :style="sizeScaleStyle">
		<div v-if="isSearchable()" class="base-cascader__search" :class="classes.search">
			<BaseIcon name="search" class="base-cascader__search-icon" :size-scale="calcIconScale('sm', sizeScale())" />
			<input
				ref="searchRef"
				v-model="searchQuery"
				type="text"
				:placeholder="UI_TEXT.SEARCH_PLACEHOLDER"
				:aria-label="UI_ARIA.SEARCH"
				:aria-controls="controls"
				:aria-activedescendant="activeDescendant"
				autocomplete="off"
				class="base-cascader__search-input"
				@click.stop
				@keydown="handleSearchKeydown" />
		</div>

		<template v-if="isSearching">
			<ul
				:id="resultsId"
				class="base-cascader__results"
				:class="classes.results"
				role="listbox"
				:aria-label="UI_ARIA.SEARCH"
				:aria-multiselectable="isMultiple() ? 'true' : undefined">
				<li
					v-for="(result, index) in results"
					:id="resultId(index)"
					:key="result.path.join('/')"
					class="base-cascader__option"
					:class="[
						{
							'base-cascader__option--active': index === activeResult,
							'base-cascader__option--selected': isPathSelected(result.path),
							'base-cascader__option--disabled': result.isDisabled,
						},
						classes.option,
					]"
					role="option"
					:aria-selected="isPathSelected(result.path) ? 'true' : 'false'"
					:aria-disabled="result.isDisabled ? 'true' : undefined"
					@click="clickResult(result)"
					@mousemove="index !== activeResult && hoverResult(index)">
					<slot
						name="option"
						:node="result.node"
						:is-selected="isPathSelected(result.path)"
						:has-children="hasChildren(result.node)">
						<span v-if="isMultiple()" class="base-cascader__checkbox" aria-hidden="true">
							<BaseIcon v-if="isPathSelected(result.path)" name="check" :size-scale="calcIconScale('xs', sizeScale())" />
						</span>
						<BaseText tag="span" class="base-cascader__option-label" :size-scale="sizeScale()">{{
							result.labels.join(separator())
						}}</BaseText>
					</slot>
				</li>
			</ul>
			<div v-if="!results.length" class="base-cascader__empty" :class="classes.empty">
				<slot name="empty">
					<BaseText tag="span" :size-scale="sizeScale()">{{ UI_TEXT.NO_RESULTS }}</BaseText>
				</slot>
			</div>
		</template>

		<div v-else class="base-cascader__columns" :class="classes.columns">
			<div
				v-for="column in columns"
				:key="column.level"
				class="base-cascader__column"
				:class="[`base-cascader__column--${column.status}`, classes.column]">
				<template v-if="column.status === 'ready'">
					<ul
						:id="columnId(column.level)"
						class="base-cascader__options"
						role="listbox"
						:aria-labelledby="columnLabelledBy(column)"
						:aria-label="columnLabel(column)"
						:aria-multiselectable="isMultiple() ? 'true' : undefined">
						<li
							v-for="(node, index) in column.nodes"
							:id="optionId(column.level, index)"
							:key="node.id"
							class="base-cascader__option"
							:class="[
								{
									'base-cascader__option--active': isActive(column, node.id),
									'base-cascader__option--expanded': isExpanded(column, node.id),
									'base-cascader__option--selected': isNodeSelected(column.level, node),
									'base-cascader__option--disabled': node.isDisabled,
								},
								classes.option,
							]"
							role="option"
							:aria-selected="isNodeSelected(column.level, node) ? 'true' : 'false'"
							:aria-disabled="node.isDisabled ? 'true' : undefined"
							@click="clickNode(column.level, node)"
							@mousemove="!isActive(column, node.id) && hoverNode(column.level, node)">
							<slot
								name="option"
								:node="node"
								:is-selected="isNodeSelected(column.level, node)"
								:has-children="hasChildren(node)">
								<span v-if="isMultiple() && isSelectable(node)" class="base-cascader__checkbox" aria-hidden="true">
									<BaseIcon
										v-if="isNodeSelected(column.level, node)"
										name="check"
										:size-scale="calcIconScale('xs', sizeScale())" />
								</span>
								<BaseIcon
									v-if="node.icon"
									:name="node.icon"
									class="base-cascader__option-icon"
									:size-scale="calcIconScale('sm', sizeScale())" />
								<span class="base-cascader__option-content">
									<BaseText tag="span" class="base-cascader__option-label" :size-scale="sizeScale()">{{
										node.label
									}}</BaseText>
									<BaseText
										v-if="node.description"
										tag="span"
										class="base-cascader__option-desc"
										:size-scale="sizeScale()"
										>{{ node.description }}</BaseText
									>
								</span>
								<BaseIcon
									v-if="hasChildren(node)"
									name="chevron-right"
									class="base-cascader__option-arrow"
									:size-scale="calcIconScale('sm', sizeScale())" />
								<BaseIcon
									v-else-if="!isMultiple() && isNodeSelected(column.level, node)"
									name="check"
									class="base-cascader__check"
									:size-scale="calcIconScale('sm', sizeScale())" />
							</slot>
						</li>
					</ul>
					<div v-if="!column.nodes.length" class="base-cascader__empty" :class="classes.empty">
						<slot name="empty">
							<BaseText tag="span" :size-scale="sizeScale()">{{ UI_TEXT.EMPTY }}</BaseText>
						</slot>
					</div>
				</template>
				<div v-else-if="column.status === 'loading'" class="base-cascader__status" :class="classes.status">
					<BaseLoader :label="UI_TEXT.LOADING" :size-scale="sizeScale()" />
				</div>
				<div v-else class="base-cascader__status" :class="classes.status">
					<BaseText tag="p" role="alert" class="base-cascader__status-text" :size-scale="sizeScale()">{{
						UI_TEXT.LOAD_ERROR
					}}</BaseText>
					<BaseButton variant="soft" :size-scale="sizeScale()" @click="retry(column)">{{ UI_TEXT.RETRY }}</BaseButton>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import { BaseLoader } from '@components/BaseLoader'
import { UI_ARIA, UI_TEXT } from '@/locales/messages'
import { calcIconScale } from '@utils/media/iconUtils'
import { useBaseCascaderPanel } from '../model/useBaseCascaderPanel'
import type { BaseCascaderSlots } from '../types/BaseCascader.types'

defineSlots<Pick<BaseCascaderSlots, 'option' | 'empty'>>()

const {
	classes,
	sizeScaleStyle,
	sizeScale,
	isSearchable,
	isMultiple,
	separator,
	searchRef,
	searchQuery,
	controls,
	activeDescendant,
	handleSearchKeydown,
	isSearching,
	results,
	resultsId,
	resultId,
	activeResult,
	isPathSelected,
	clickResult,
	hoverResult,
	hasChildren,
	columns,
	columnId,
	columnLabelledBy,
	columnLabel,
	optionId,
	isActive,
	isExpanded,
	isNodeSelected,
	isSelectable,
	clickNode,
	hoverNode,
	retry,
} = useBaseCascaderPanel()
</script>
