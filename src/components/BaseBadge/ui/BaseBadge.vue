<template>
	<span
		:class="[
			ui('root'),
			variantClass,
			statusClass,
			{
				'base-badge--clickable': isClickable,
				'base-badge--disabled': isDisabled,
				'base-badge--dot': isDot,
				'base-badge--round': isRound,
				'base-badge--removable': isRemovable,
			},
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		v-bind="{ ...clickableAttributes, ...dotAttributes }"
		@click="handleClick"
		@keydown="handleKeydown">
		<slot>
			<Transition v-if="!isDot" name="base-badge-text">
				<span :key="label" :class="[ui('text'), classes.text]">{{ label }}</span>
			</Transition>
		</slot>
		<button
			v-if="isRemovable"
			ref="removeButton"
			type="button"
			:class="[ui('remove'), classes.remove]"
			:tabindex="isRemoveFocusable ? undefined : -1"
			:disabled="isDisabled"
			:aria-label="resolvedRemoveLabel"
			@mousedown.prevent
			@click.stop="handleRemove">
			<BaseIcon name="x-mark" :size-scale="removeIconScale" />
		</button>
	</span>
</template>

<script setup lang="ts">
import '../styles/BaseBadge.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseBadge } from '../model/useBaseBadge'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseBadgeEmits, BaseBadgeProps, BaseBadgeSlots } from '../types/BaseBadge.types'

const props = withDefaults(
	defineProps<BaseBadgeProps>(),
	kitDefaults('BaseBadge', {
		variant: DEFAULT_VARIANT,
		status: 'primary',
		isDot: false,
		isRound: false,
		isRemovable: false,
		isRemoveFocusable: true,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseBadgeEmits>()
defineSlots<BaseBadgeSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	statusClass,
	variantStyle,
	customColorStyle,
	classes,
	isClickable,
	clickableAttributes,
	dotAttributes,
	resolvedRemoveLabel,
	removeIconScale,
	removeButton,
	handleClick,
	handleRemove,
	handleKeydown,
} = useBaseBadge(props, emit)

defineExpose({ removeButton })
</script>
