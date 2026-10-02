<template>
	<span
		class="base-tag"
		:class="[
			variantClass,
			`base-tag--tone-${tone}`,
			{
				'base-tag--selected': isSelected,
				'base-tag--interactive': isMainFocusable,
				'base-tag--removable': isRemovable,
				'base-tag--disabled': isDisabled,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		@keydown="handleRootKeydown">
		<component
			:is="mainTag"
			class="base-tag__main"
			:class="classes.main"
			v-bind="mainAttributes"
			@click="handleClick"
			@keydown="handleKeydown">
			<BaseIcon v-if="isSelected" name="check" class="base-tag__icon" :custom-class="classes.icon" :size-scale="iconScale" />
			<span v-else-if="$slots.icon" class="base-tag__icon" :class="classes.icon"><slot name="icon" /></span>
			<BaseIcon v-else-if="icon" :name="icon" class="base-tag__icon" :custom-class="classes.icon" :size-scale="iconScale" />
			<span class="base-tag__text" :class="classes.text">
				<slot>{{ label }}</slot>
			</span>
		</component>
		<button
			v-if="isRemovable"
			type="button"
			class="base-tag__remove"
			:class="classes.remove"
			:aria-label="removeButtonLabel"
			:tabindex="removeTabindex"
			:disabled="isDisabled"
			@click="handleRemove">
			<BaseIcon name="close" :size-scale="iconScale" />
		</button>
	</span>
</template>

<script setup lang="ts">
import '../styles/BaseTag.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseTag } from '../model/useBaseTag'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseTagEmits, BaseTagProps, BaseTagSlots } from '../types/BaseTag.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseTagProps>(),
	kitDefaults('BaseTag', {
		variant: DEFAULT_VARIANT,
		tone: 'neutral',
		isSelectable: false,
		isSelected: false,
		isRemovable: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseTagEmits>()
defineSlots<BaseTagSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	iconScale,
	isMainFocusable,
	mainTag,
	mainAttributes,
	isSelected,
	removeTabindex,
	removeButtonLabel,
	handleClick,
	handleKeydown,
	handleRootKeydown,
	handleRemove,
} = useBaseTag(props, emit)
</script>
