<template>
	<div class="base-menu" :class="[variantClass]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div v-for="(group, gIndex) in items" :key="gIndex" class="base-menu__group">
			<div
				v-for="(item, iIndex) in group"
				:key="iIndex"
				class="base-menu__item"
				:class="[
					{
						'base-menu__item--disabled': item.isDisabled,
					},
				]"
				@click="handleItemClick(item)">
				<BaseIcon v-if="item.icon" class="base-menu__icon" :name="item.icon" size="sm" :size-scale="sizeScale" />
				<BaseText class="base-menu__label" :size-scale="sizeScale">{{ item.label }}</BaseText>
			</div>
			<BaseSeparator v-if="gIndex < items.length - 1" class="base-menu__divider" :size-scale="sizeScale" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseSeparator } from '@/shared/ui/BaseSeparator'
import { BaseText } from '@/shared/ui/BaseText'
import './BaseMenu.style.scss'
import type { BaseMenuEmits, BaseMenuItem, BaseMenuProps } from './BaseMenu.types'

const props = withDefaults(defineProps<BaseMenuProps>(), {
	variant: 'default',
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-menu', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseMenuEmits>()

function handleItemClick(item: BaseMenuItem): void {
	if (item.isDisabled) return

	if (item.click) {
		item.click()
	}

	emit('select', item)
}
</script>
