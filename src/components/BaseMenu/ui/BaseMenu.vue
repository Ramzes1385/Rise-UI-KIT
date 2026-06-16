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
					:size-scale="calcIconScale('sm', props.sizeScale)" />
				<BaseText class="base-menu__label" :class="classes.label" :size-scale="props.sizeScale">{{ item.label }}</BaseText>
			</div>
			<BaseSeparator
				v-if="gIndex < items.length - 1"
				class="base-menu__divider"
				:class="classes.divider"
				:size-scale="props.sizeScale" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseSeparator } from '@components/BaseSeparator'
import { BaseText } from '@components/BaseText'
import { useBaseComponent } from '@composables/useBaseComponent'
import '../styles/BaseMenu.style.scss'
import type { BaseMenuEmits, BaseMenuItem, BaseMenuProps } from '../model/BaseMenu.types'

const props = withDefaults(defineProps<BaseMenuProps>(), {
	sizeScale: 100,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-menu',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
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
