<template>
	<div class="base-menu" :class="[variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-for="(group, gIndex) in items" :key="gIndex" class="base-menu__group" :class="classes.group">
			<template v-for="(item, iIndex) in group" :key="iIndex">
				<!--
					Пункт — действие (select / item.click), поэтому role="button" с Enter/Space.
					role="menu/menuitem" не используется: он обещает стрелочную навигацию APG Menu,
					которой здесь нет, и неверен, когда BaseMenu служит навигационным списком.
				-->
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
				<!-- Разделитель после пункта. После последнего пункта группы линию уже рисует разделитель групп -->
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
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/iconUtils'
import { kitDefaults } from '@composables/useDefaults'
import { BaseSeparator } from '@components/BaseSeparator'
import '../styles/BaseMenu.style.scss'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseMenu } from '../model/useBaseMenu'
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
