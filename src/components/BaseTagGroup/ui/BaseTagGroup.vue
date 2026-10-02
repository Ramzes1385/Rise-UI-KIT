<template>
	<div
		ref="rootRef"
		class="base-tag-group"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle]"
		role="group"
		:aria-label="groupLabel()"
		tabindex="-1">
		<BaseTag
			v-for="(item, index) in items"
			:key="item.value"
			:label="item.label"
			:icon="item.icon"
			:tone="item.tone ?? tone"
			:variant="variant"
			:color="color"
			:size-scale="sizeScale"
			:custom-class="classes.tag"
			:is-selectable="selectionMode !== 'none'"
			:is-selected="isItemSelected(item)"
			:is-removable="isItemRemovable(item)"
			:is-disabled="isItemDisabled(item)"
			@update:is-selected="handleSelect(item, $event)"
			@remove="handleRemove(item, index)">
			<template v-if="$slots.tag" #default>
				<slot name="tag" :item="item" :is-selected="isItemSelected(item)" />
			</template>
		</BaseTag>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseTagGroup.style.scss'
import { BaseTag } from '@components/BaseTag'
import { useBaseTagGroup } from '../model/useBaseTagGroup'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseTagGroupEmits, BaseTagGroupProps, BaseTagGroupSlots } from '../types/BaseTagGroup.types'

const props = withDefaults(
	defineProps<BaseTagGroupProps>(),
	kitDefaults('BaseTagGroup', {
		variant: DEFAULT_VARIANT,
		modelValue: null,
		selectionMode: 'none',
		isRemovable: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseTagGroupEmits>()
defineSlots<BaseTagGroupSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	classes,
	rootRef,
	groupLabel,
	isItemSelected,
	isItemRemovable,
	isItemDisabled,
	handleSelect,
	handleRemove,
} = useBaseTagGroup(props, emit)
</script>
