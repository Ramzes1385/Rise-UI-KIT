<template>
	<BaseDropdown
		v-model:is-open="isOpen"
		:class="ui('dropdown')"
		position="bottom-start"
		:match-width="true"
		:size-scale="sizeScale"
		:padding="0"
		:custom-class="classes.dropdown"
		@close="handleClose">
		<div
			:class="[
				ui('root'),
				variantClass,
				{
					'base-tree-select--open': isOpen,
					'base-tree-select--disabled': isControlDisabled,
					'base-tree-select--error': control.hasError.value,
					'base-tree-select--multiple': isMultiple,
					'base-tree-select--has-tags': tagNodes.length > 0 || moreCount > 0,
				},
				classes.root,
			]"
			:style="[sizeScaleStyle, variantStyle, customColorStyle]">
			<FormFieldLabel
				v-if="label"
				:id="labelId"
				tag="span"
				:label="label"
				:is-required="isRequired"
				:class-name="ui('label')"
				:custom-class="classes.label"
				:required-class-name="ui('required')"
				:required-custom-class="classes.required"
				:size-scale="sizeScale"
				@click="focusTrigger" />

			<div
				ref="triggerRef"
				:class="[ui('trigger'), classes.trigger]"
				role="combobox"
				:tabindex="isControlDisabled ? undefined : 0"
				aria-haspopup="tree"
				:aria-expanded="isOpen ? 'true' : 'false'"
				:aria-controls="isOpen ? popupId : undefined"
				:aria-activedescendant="isOpen && activeIndex >= 0 && !isLoading ? getRowId(activeIndex) : undefined"
				:aria-busy="isLoading ? 'true' : undefined"
				v-bind="triggerAttrs"
				:aria-disabled="isControlDisabled ? 'true' : undefined"
				@click="toggleDropdown"
				@keydown="handleKeydown">
				<div :class="[ui('values'), classes.values]">
					<template v-if="tagNodes.length || moreCount">
						<slot v-if="$slots.tag" name="tag" :nodes="tagNodes" :remove="removeValue" />
						<template v-else>
							<BaseBadge
								v-for="node in tagNodes"
								:key="node.id"
								variant="soft"
								:class="ui('tag')"
								:custom-class="classes.tag"
								:size-scale="sizeScale">
								<BaseText tag="span" :class="ui('tag-text')" :custom-class="classes.tagText" :size-scale="sizeScale">{{
									node.label
								}}</BaseText>
								<button
									v-if="!isControlDisabled && !node.isDisabled"
									type="button"
									:class="[ui('tag-close'), classes.tagClose]"
									tabindex="-1"
									:aria-label="formatMessage(UI_TEXT.DELETE_ITEM, { name: node.label })"
									@click.stop="removeValue(node.id)">
									<BaseIcon name="x-mark" :size-scale="calcIconScale('xs', sizeScale)" />
								</button>
							</BaseBadge>
						</template>
						<BaseBadge v-if="moreCount" variant="soft" :class="ui('more')" :custom-class="classes.more" :size-scale="sizeScale"
							>+{{ moreCount }}</BaseBadge
						>
					</template>
					<template v-else-if="selectedNode">
						<slot name="selected" :node="selectedNode">
							<BaseText tag="span" :class="ui('value-text')" :custom-class="classes.valueText" :size-scale="sizeScale">{{
								selectedNode.label
							}}</BaseText>
						</slot>
					</template>
					<BaseText v-else tag="span" :class="ui('placeholder')" :custom-class="classes.placeholder" :size-scale="sizeScale">{{
						resolvedPlaceholder
					}}</BaseText>
				</div>
				<BaseIcon
					:class="ui('arrow')"
					:custom-class="classes.arrow"
					name="chevron-down"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</div>

			<FormFieldError
				:id="errorId"
				:error="formField.error"
				:class-name="ui('error-text')"
				:custom-class="classes.errorText"
				:size-scale="sizeScale" />
		</div>

		<template #dropdown>
			<BaseTreeSelectPanel
				v-model:search-query="searchQuery"
				:rows="rows"
				:is-searchable="isSearchable"
				:is-multiple="isMultiple"
				:is-loading="isLoading"
				:size-scale="sizeScale"
				:selected-set="selectedSet"
				:indeterminate-set="indeterminateSet"
				:classes="classes"
				:ui="ui"
				:size-scale-style="sizeScaleStyle"
				:tree-id="treeId"
				:popup-id="popupId"
				:labelledby="triggerLabelledBy"
				:tree-label="unlabelledName"
				:active-index="activeIndex"
				:get-row-id="getRowId"
				@select="selectRow"
				@toggle="toggleRow"
				@activate="setActive"
				@search-keydown="handleKeydown($event, true)">
				<template #node="slotProps">
					<slot name="node" v-bind="slotProps" />
				</template>
				<template #empty>
					<slot name="empty" />
				</template>
			</BaseTreeSelectPanel>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import '@components/BaseText/styles/BaseText.style.scss'
import '../styles/BaseTreeSelect.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseBadge } from '@components/BaseBadge'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseDropdown } from '@components/BaseDropdown'
import BaseTreeSelectPanel from './BaseTreeSelectPanel.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseTreeSelect } from '../model/useBaseTreeSelect'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseTreeSelectEmits, BaseTreeSelectProps, BaseTreeSelectSlots } from '../types/BaseTreeSelect.types'

const props = withDefaults(
	defineProps<BaseTreeSelectProps>(),
	kitDefaults('BaseTreeSelect', {
		modelValue: '',
		label: '',
		isRequired: false,
		isMultiple: false,
		checkedStrategy: 'child',
		isSearchable: false,
		isDefaultExpandAll: false,
		isLoading: false,
		isDisabled: false,
		error: '',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseTreeSelectEmits>()
defineSlots<BaseTreeSelectSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	labelId,
	errorId,
	treeId,
	popupId,
	formField,
	isControlDisabled,
	control,
	getRowId,
	triggerLabelledBy,
	unlabelledName,
	triggerAttrs,
	resolvedPlaceholder,
	selectedNode,
	tagNodes,
	moreCount,
	triggerRef,
	isOpen,
	searchQuery,
	rows,
	selectedSet,
	indeterminateSet,
	activeIndex,
	setActive,
	selectRow,
	toggleRow,
	removeValue,
	handleClose,
	toggleDropdown,
	focusTrigger,
	handleKeydown,
	exposed,
} = useBaseTreeSelect(props, emit)

defineExpose(exposed)
</script>
