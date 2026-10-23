<template>
	<div :class="[ui('root'), variantClass, classes.root]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-for="(group, gIndex) in items" :key="gIndex" :class="[ui('group'), classes.group]">
			<template v-for="(item, iIndex) in group" :key="iIndex">
				<component
					:is="isLink(item) ? BaseLink : 'div'"
					v-bind="itemAttrs(item)"
					:class="[
						ui('item'),
						{
							'base-menu__item--disabled': item.isDisabled,
						},
						classes.item,
					]"
					@click="handleItemClick(item)"
					@keydown="handleItemKeydown(item, $event)">
					<BaseIcon
						v-if="item.icon"
						:class="[ui('icon'), classes.icon]"
						:name="item.icon"
						:size-scale="calcIconScale('sm', sizeScale)" />
					<span :class="[ui('label'), classes.label]">{{ item.label }}</span>
				</component>
				<BaseSeparator
					v-if="item.hasDivider && iIndex < group.length - 1"
					:class="[ui('divider'), classes.divider]"
					:size-scale="sizeScale" />
			</template>
			<BaseSeparator v-if="gIndex < items.length - 1" :class="[ui('divider'), classes.divider]" :size-scale="sizeScale" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseMenu.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { useBaseMenu } from '../model/useBaseMenu'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseSeparator } from '@components/BaseSeparator'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes, ui, isLink, itemAttrs, handleItemClick, handleItemKeydown } =
	useBaseMenu(props, emit)
</script>
