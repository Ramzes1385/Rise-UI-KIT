<template>
	<div
		class="base-menu"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-for="(group, gIndex) in items" :key="gIndex" class="base-menu__group" :class="classes.group">
			<div
				v-for="(item, iIndex) in group"
				:key="iIndex"
				class="base-menu__item"
				tabindex="0"
				:class="[
					{
						'base-menu__item--disabled': item.isDisabled,
					},
					classes.item,
				]"
				@click="handleItemClick(item)">
				<BaseIcon
					v-if="item.icon"
					class="base-menu__icon"
					:class="classes.icon"
					:name="item.icon"
					:size-scale="calcIconScale('sm', sizeScale)" />
				<BaseText class="base-menu__label" :class="classes.label" :size-scale="sizeScale">{{ item.label }}</BaseText>
			</div>
			<BaseSeparator
				v-if="gIndex < items.length - 1"
				class="base-menu__divider"
				:class="classes.divider"
				:size-scale="sizeScale" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseSeparator } from '@components/BaseSeparator'
import { BaseText } from '@components/BaseText'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import './BaseMenu.style.scss'
import type { BaseMenuEmits, BaseMenuItem, BaseMenuProps } from './BaseMenu.types'

const props = withDefaults(defineProps<BaseMenuProps>(), {
	variant: 'default',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-menu', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'group', 'item', 'icon', 'label', 'divider'],
})

const emit = defineEmits<BaseMenuEmits>()

function handleItemClick(item: BaseMenuItem): void {
	if (item.isDisabled) return

	if (item.click) {
		item.click()
	}

	emit('select', item)
}
</script>
