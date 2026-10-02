<template>
	<BaseDropdown
		ref="dropdownRef"
		v-model:is-open="isOpen"
		class="base-cascader__dropdown"
		position="bottom-start"
		max-height="none"
		:size-scale="sizeScale"
		:padding="0"
		:custom-class="classes.dropdown"
		@close="handleClose">
		<div
			class="base-cascader"
			:class="[
				variantClass,
				{
					'base-cascader--open': isOpen,
					'base-cascader--disabled': isControlDisabled,
					'base-cascader--error': control.hasError.value,
					'base-cascader--multiple': isMultiple,
					'base-cascader--has-tags': hasTags,
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
				class-name="base-cascader__label"
				:custom-class="classes.label"
				required-class-name="base-cascader__required"
				:required-custom-class="classes.required"
				:size-scale="sizeScale"
				@click="focusTrigger" />

			<div
				ref="triggerRef"
				class="base-cascader__trigger"
				:class="classes.trigger"
				role="combobox"
				:tabindex="isControlDisabled ? undefined : 0"
				aria-haspopup="listbox"
				:aria-expanded="isOpen ? 'true' : 'false'"
				:aria-controls="controls"
				:aria-activedescendant="activeDescendant"
				:aria-busy="isLoading ? 'true' : undefined"
				v-bind="triggerAttrs"
				:aria-disabled="isControlDisabled ? 'true' : undefined"
				@click="toggle"
				@keydown="handleTriggerKeydown">
				<div class="base-cascader__values" :class="classes.values">
					<template v-if="hasTags">
						<BaseBadge
							v-for="tag in tags"
							:key="tag.key"
							variant="soft"
							class="base-cascader__tag"
							:custom-class="classes.tag"
							:size-scale="sizeScale">
							<BaseText tag="span" class="base-cascader__tag-text" :size-scale="sizeScale">{{ tag.text }}</BaseText>
							<button
								v-if="!isControlDisabled"
								type="button"
								class="base-cascader__tag-close"
								tabindex="-1"
								:aria-label="`${UI_TEXT.DELETE} ${tag.text}`"
								@click.stop="remove(tag.path)">
								<BaseIcon name="x-mark" :size-scale="calcIconScale('xs', sizeScale)" />
							</button>
						</BaseBadge>
					</template>
					<template v-else-if="singlePath.length">
						<slot name="selected" :path="singlePath" :labels="singleLabels" :nodes="singleNodes">
							<BaseText
								tag="span"
								class="base-cascader__value-text"
								:custom-class="classes.valueText"
								:size-scale="sizeScale"
								>{{ displayText }}</BaseText
							>
						</slot>
					</template>
					<BaseText
						v-else
						tag="span"
						class="base-cascader__placeholder"
						:custom-class="classes.placeholder"
						:size-scale="sizeScale"
						>{{ resolvedPlaceholder }}</BaseText
					>
				</div>
				<BaseIcon
					class="base-cascader__arrow"
					:custom-class="classes.arrow"
					name="chevron-down"
					:size-scale="calcIconScale('sm', sizeScale)" />
			</div>

			<FormFieldError
				:id="errorId"
				:error="formField.error"
				class-name="base-cascader__error-text"
				:custom-class="classes.errorText"
				:size-scale="sizeScale" />
		</div>

		<template #dropdown>
			<BaseCascaderPanel>
				<template #option="slotProps">
					<slot name="option" v-bind="slotProps" />
				</template>
				<template #empty>
					<slot name="empty" />
				</template>
			</BaseCascaderPanel>
		</template>
	</BaseDropdown>
</template>

<script setup lang="ts">
import '@components/BaseText/styles/BaseText.style.scss'
import '../styles/BaseCascader.style.scss'
import { UI_TEXT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseBadge } from '@components/BaseBadge'
import { calcIconScale } from '@utils/media/iconUtils'
import BaseCascaderPanel from './BaseCascaderPanel.vue'
import { BaseDropdown } from '@components/BaseDropdown'
import { useBaseCascader } from '../model/useBaseCascader'
import { kitDefaults } from '@composables/base/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCascaderEmits, BaseCascaderProps, BaseCascaderSlots } from '../types/BaseCascader.types'

const props = withDefaults(
	defineProps<BaseCascaderProps>(),
	kitDefaults('BaseCascader', {
		modelValue: () => [],
		label: '',
		separator: ' / ',
		isRequired: false,
		isMultiple: false,
		isSearchable: false,
		isAnyLevel: false,
		isLoading: false,
		isDisabled: false,
		error: '',
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseCascaderEmits>()
defineSlots<BaseCascaderSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	labelId,
	errorId,
	formField,
	isControlDisabled,
	control,
	triggerAttrs,
	resolvedPlaceholder,
	triggerRef,
	dropdownRef,
	isOpen,
	controls,
	activeDescendant,
	singlePath,
	singleLabels,
	singleNodes,
	displayText,
	tags,
	hasTags,
	remove,
	toggle,
	handleClose,
	focusTrigger,
	handleTriggerKeydown,
	exposed,
} = useBaseCascader(props, emit)

defineExpose(exposed)
</script>
