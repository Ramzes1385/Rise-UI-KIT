<template>
	<div class="base-menu" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-for="(group, gIndex) in items" :key="gIndex" class="base-menu__group" :class="classes.group">
			<template v-for="(item, iIndex) in group" :key="iIndex">
				<div
					class="base-menu__item"
					role="button"
					tabindex="0"
					:aria-disabled="item.isDisabled || undefined"
					:class="[
						{
							'base-menu__item--disabled': item.isDisabled,
						},
						classes.item,
					]"
					@click="handleItemClick(item)"
					@keydown.enter.prevent="handleItemClick(item)"
					@keydown.space.prevent="handleItemClick(item)">
					<BaseIcon
						v-if="item.icon"
						class="base-menu__icon"
						:class="classes.icon"
						:name="item.icon"
						:size-scale="calcIconScale('sm', sizeScale)" />
					<span class="base-menu__label" :class="classes.label">{{ item.label }}</span>
				</div>
				<BaseSeparator
					v-if="item.hasDivider && iIndex < group.length - 1"
					class="base-menu__divider"
					:class="classes.divider"
					:size-scale="sizeScale" />
			</template>
			<BaseSeparator v-if="gIndex < items.length - 1" class="base-menu__divider" :class="classes.divider" :size-scale="sizeScale" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseMenu.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { useBaseMenu } from '../model/useBaseMenu'
import { kitDefaults } from '@composables/useDefaults'
import { BaseSeparator } from '@components/BaseSeparator'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseMenuEmits, BaseMenuProps, BaseMenuSlots } from '../types/BaseMenu.types'

const props = withDefaults(
	defineProps<BaseMenuProps>(),
	kitDefaults('BaseMenu', {
		variant: DEFAULT_VARIANT,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseMenuEmits>()
defineSlots<BaseMenuSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, handleItemClick } = useBaseMenu(props, emit)
</script>
