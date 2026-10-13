<template>
	<span
		:class="[
			ui('root'),
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
		<component :is="mainTag" :class="[ui('main'), classes.main]" v-bind="mainAttributes" @click="handleClick" @keydown="handleKeydown">
			<span class="base-tag__lead" :class="{ 'base-tag__lead--open': hasLead || $slots.icon }">
				<span class="base-tag__lead-clip">
					<Transition name="base-tag__icon">
						<BaseIcon v-if="isSelected" name="check" :class="ui('icon')" :custom-class="classes.icon" :size-scale="iconScale" />
						<span v-else-if="$slots.icon" :class="[ui('icon'), classes.icon]"><slot name="icon" /></span>
						<BaseIcon v-else-if="icon" :name="icon" :class="ui('icon')" :custom-class="classes.icon" :size-scale="iconScale" />
					</Transition>
				</span>
			</span>
			<span :class="[ui('text'), classes.text]">
				<slot>{{ label }}</slot>
			</span>
		</component>
		<Transition name="base-tag__remove">
			<button
				v-if="isRemovable"
				type="button"
				:class="[ui('remove'), classes.remove]"
				:aria-label="removeButtonLabel"
				:tabindex="removeTabindex"
				:disabled="isDisabled"
				@click="handleRemove">
				<BaseIcon name="close" :size-scale="iconScale" />
			</button>
		</Transition>
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
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	iconScale,
	isMainFocusable,
	hasLead,
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
