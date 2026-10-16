<template>
	<label
		data-indicator-item
		:class="[
			ui('segment'),
			{
				'base-segmented__segment--checked': isChecked,
				'base-segmented__segment--disabled': isDisabled,
				'base-segmented__segment--icon-only': isIconOnly,
			},
			customClass,
		]">
		<input
			type="radio"
			:class="ui('input')"
			:name="name"
			:value="option.value"
			:checked="isChecked"
			:disabled="isDisabled"
			@change="$emit('select', option.value)" />
		<BaseIcon v-if="option.icon" :name="option.icon" :class="ui('icon')" :size-scale="calcIconScale('sm', sizeScale)" />
		<span :class="[ui('text'), { 'base-segmented__text--hidden': isIconOnly }]">{{ option.label }}</span>
	</label>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/media/iconUtils'
import type { SegmentedItemEmits, SegmentedItemProps } from '../types/BaseSegmented.types'

defineProps<SegmentedItemProps>()

defineEmits<SegmentedItemEmits>()
</script>
