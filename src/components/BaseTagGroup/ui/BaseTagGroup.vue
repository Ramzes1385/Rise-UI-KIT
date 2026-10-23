<template>
	<div
		ref="rootRef"
		:class="[ui('root'), variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle]"
		role="group"
		:aria-label="groupLabel()"
		tabindex="-1">
		<TransitionGroup name="base-tag-group__tag" @before-leave="holdLeavingPlace">
			<BaseTag
				v-for="(item, index) in items"
				:key="item.value"
				:class="ui('tag')"
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
		</TransitionGroup>
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
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	classes,
	rootRef,
	holdLeavingPlace,
	groupLabel,
	isItemSelected,
	isItemRemovable,
	isItemDisabled,
	handleSelect,
	handleRemove,
} = useBaseTagGroup(props, emit)
</script>
