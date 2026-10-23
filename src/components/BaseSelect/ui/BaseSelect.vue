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
					'base-select--open': isOpen,
					'base-select--disabled': isControlDisabled,
					'base-select--error': control.hasError.value,
					'base-select--multiple': isMultiple,
					'base-select--has-tags': hasTags,
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
				ref="selectRef"
				:class="[ui('trigger'), classes.trigger]"
				role="combobox"
				:tabindex="isControlDisabled ? undefined : 0"
				aria-haspopup="listbox"
				:aria-expanded="isOpen ? 'true' : 'false'"
				:aria-controls="isOpen ? listboxId : undefined"
				:aria-activedescendant="isOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined"
				v-bind="triggerAttrs"
				:aria-disabled="isControlDisabled ? 'true' : undefined"
				@click="toggleDropdown"
				@keydown="handleTriggerKeydown">
				<slot name="trigger" :is-open="isOpen" :selected-label="selectedLabel" :selected-labels="selectedLabels">
					<div :class="[ui('values'), classes.values]">
						<slot
							v-if="hasTags && $slots.tag"
							name="tag"
							:labels="selectedLabels"
							:items="selectedItems"
							:remove="removeValue" />
						<TransitionGroup
							v-else-if="isMultiple"
							name="base-select-tag"
							:css="!isMotionReduced"
							@before-leave="holdLeavingTag">
							<BaseBadge
								v-for="item in selectedItems"
								:key="item.value"
								variant="soft"
								:class="ui('tag')"
								:custom-class="{ root: classes.tag, remove: classes.tagClose }"
								:ui="{ remove: ui('tag-close') }"
								:is-removable="!isControlDisabled"
								:is-remove-focusable="false"
								:remove-label="formatMessage(UI_ARIA.TAG_REMOVE, { name: item.label })"
								@remove="removeValue(item.value)"
								:size-scale="sizeScale">
								<BaseText tag="span" :class="ui('tag-text')" :custom-class="classes.tagText" :size-scale="sizeScale">{{
									item.label
								}}</BaseText>
							</BaseBadge>
						</TransitionGroup>
						<template v-if="!isMultiple && selectedOption">
							<slot name="selected" :option="selectedOption">
								<BaseText
									v-if="selectedOption.icon"
									tag="span"
									:class="ui('icon')"
									:custom-class="classes.icon"
									:size-scale="sizeScale"
									>{{ selectedOption.icon }}</BaseText
								>
								<BaseText tag="span" :class="ui('value-text')" :custom-class="classes.valueText" :size-scale="sizeScale">{{
									selectedLabel
								}}</BaseText>
							</slot>
						</template>
						<BaseText
							v-else-if="!hasTags"
							tag="span"
							:class="ui('placeholder')"
							:custom-class="classes.placeholder"
							:size-scale="sizeScale"
							>{{ resolvedPlaceholder }}</BaseText
						>
					</div>
				</slot>
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
			<BaseSelectDropdown
				v-model:search-query="searchQuery"
				:filtered-options="filteredOptions"
				:is-searchable="isSearchable"
				:is-multiple="isMultiple"
				:size-scale="sizeScale"
				:is-selected="isSelected"
				:classes="classes"
				:part-class="ui"
				:is-motion-reduced="isMotionReduced"
				:size-scale-style="sizeScaleStyle"
				:listbox-id="listboxId"
				:labelledby="triggerLabelledBy"
				:listbox-label="unlabelledName"
				:active-index="activeIndex"
				:get-option-id="getOptionId"
				@select="handleSelect"
				@activate="setActive"
				@search-keydown="handleSearchKeydown">
				<template v-if="$slots.header" #header>
					<slot name="header" />
				</template>
				<template #option="slotProps">
					<slot name="option" v-bind="slotProps" />
				</template>
				<template #empty>
					<slot name="empty" />
				</template>
				<template v-if="$slots.footer" #footer>
					<slot name="footer" />
				</template>
			</BaseSelectDropdown>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import '@components/BaseText/styles/BaseText.style.scss'
import '../styles/BaseSelect.style.scss'
import { formatMessage } from '@/locales'
import { UI_ARIA } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseBadge } from '@components/BaseBadge'
import { useBaseSelect } from '../model/useBaseSelect'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseDropdown } from '@components/BaseDropdown'
import BaseSelectDropdown from './BaseSelectDropdown.vue'
import { kitDefaults } from '@composables/base/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseSelectEmits, BaseSelectProps, BaseSelectSlots } from '../types/BaseSelect.types'

const props = withDefaults(
	defineProps<BaseSelectProps>(),
	kitDefaults('BaseSelect', {
		modelValue: '',
		label: '',
		isRequired: false,
		isMultiple: false,
		isSearchable: false,
		isDisabled: false,
		error: '',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseSelectEmits>()
defineSlots<BaseSelectSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	labelId,
	errorId,
	listboxId,
	formField,
	isControlDisabled,
	control,
	getOptionId,
	triggerLabelledBy,
	unlabelledName,
	triggerAttrs,
	resolvedPlaceholder,
	selectRef,
	isOpen,
	searchQuery,
	activeIndex,
	selectedOption,
	selectedLabel,
	selectedItems,
	selectedLabels,
	filteredOptions,
	toggleDropdown,
	handleClose,
	isSelected,
	handleSelect,
	setActive,
	removeValue,
	hasTags,
	focusTrigger,
	handleTriggerKeydown,
	handleSearchKeydown,
	ui,
	isMotionReduced,
	holdLeavingTag,
	exposed,
} = useBaseSelect(props, emit)

defineExpose(exposed)
</script>
