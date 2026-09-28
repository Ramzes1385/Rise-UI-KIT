<template>
	<BaseDropdown
		v-model:is-open="isOpen"
		class="base-select__dropdown"
		position="bottom-start"
		:match-width="true"
		:size-scale="sizeScale"
		:padding="0"
		:custom-class="classes.dropdown"
		@close="handleClose">
		<div
			class="base-select"
			:class="[
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
			<!-- Подпись — имя триггера (aria-labelledby); клик по ней ставит фокус на триггер, как у нативного select -->
			<FormFieldLabel
				v-if="label"
				:id="labelId"
				tag="span"
				:label="label"
				:is-required="isRequired"
				class-name="base-select__label"
				:custom-class="classes.label"
				required-class-name="base-select__required"
				:required-custom-class="classes.required"
				:size-scale="sizeScale"
				@click="focusTrigger" />

			<!-- Триггер — combobox по шаблону APG «select-only»: фокус остаётся на нём, активная опция — aria-activedescendant -->
			<div
				ref="selectRef"
				class="base-select__trigger"
				:class="classes.trigger"
				role="combobox"
				:tabindex="isControlDisabled ? undefined : 0"
				aria-haspopup="listbox"
				:aria-expanded="isOpen ? 'true' : 'false'"
				:aria-controls="isOpen ? listboxId : undefined"
				:aria-activedescendant="isOpen && activeIndex >= 0 ? getOptionId(activeIndex) : undefined"
				:aria-labelledby="triggerLabelledBy"
				:aria-label="triggerLabelledBy ? undefined : resolvedPlaceholder"
				v-bind="control.aria.value"
				:aria-disabled="isControlDisabled ? 'true' : undefined"
				@click="toggleDropdown"
				@keydown="handleTriggerKeydown">
				<slot name="trigger" :is-open="isOpen" :selected-label="selectedLabel" :selected-labels="selectedLabels">
					<div class="base-select__values" :class="classes.values">
						<template v-if="hasTags">
							<slot v-if="$slots.tag" name="tag" :labels="selectedLabels" :items="selectedItems" :remove="removeValue" />
							<template v-else>
								<BaseBadge
									v-for="item in selectedItems"
									:key="item.value"
									variant="soft"
									class="base-select__tag"
									:custom-class="classes.tag"
									:size-scale="sizeScale">
									<BaseText
										tag="span"
										class="base-select__tag-text"
										:custom-class="classes.tagText"
										:size-scale="sizeScale"
										>{{ item.label }}</BaseText
									>
									<!-- Мышью убирает значение; с клавиатуры то же делает повторный выбор опции в списке -->
									<button
										v-if="!isControlDisabled"
										type="button"
										class="base-select__tag-close"
										:class="classes.tagClose"
										tabindex="-1"
										:aria-label="`${UI_TEXT.DELETE} ${item.label}`"
										@click.stop="removeValue(item.value)">
										<BaseIcon name="x-mark" :size-scale="calcIconScale('xs', sizeScale)" />
									</button>
								</BaseBadge>
							</template>
						</template>
						<template v-else-if="!isMultiple && selectedOption">
							<slot name="selected" :option="selectedOption">
								<BaseText
									v-if="selectedOption.icon"
									tag="span"
									class="base-select__icon"
									:custom-class="classes.icon"
									:size-scale="sizeScale"
									>{{ selectedOption.icon }}</BaseText
								>
								<BaseText
									tag="span"
									class="base-select__value-text"
									:custom-class="classes.valueText"
									:size-scale="sizeScale"
									>{{ selectedLabel }}</BaseText
								>
							</slot>
						</template>
						<BaseText
							v-else
							tag="span"
							class="base-select__placeholder"
							:custom-class="classes.placeholder"
							:size-scale="sizeScale"
							>{{ resolvedPlaceholder }}</BaseText
						>
					</div>
				</slot>
				<BaseIcon
					class="base-select__arrow"
					:custom-class="classes.arrow"
					name="chevron-down"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</div>

			<FormFieldError
				:id="errorId"
				:error="formField.error"
				class-name="base-select__error-text"
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
				:size-scale-style="sizeScaleStyle"
				:listbox-id="listboxId"
				:labelledby="label ? labelId : undefined"
				:listbox-label="resolvedPlaceholder"
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
import { UI_TEXT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { calcIconScale } from '@utils/iconUtils'
import { BaseBadge } from '@components/BaseBadge'
import { kitDefaults } from '@composables/useDefaults'
import { BaseDropdown } from '@components/BaseDropdown'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import '../styles/BaseSelect.style.scss'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseSelect } from '../model/useBaseSelect'
import BaseSelectDropdown from './BaseSelectDropdown.vue'
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
	exposed,
} = useBaseSelect(props, emit)

defineExpose(exposed)
</script>
