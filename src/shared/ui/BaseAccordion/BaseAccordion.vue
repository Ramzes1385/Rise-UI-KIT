<template>
	<div class="base-accordion" :class="[variantClass]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div
			v-for="(item, index) in items"
			:key="index"
			class="base-accordion__item"
			:class="{
				'base-accordion__item--open': openIndexes.includes(index),
				'base-accordion__item--disabled': item.isDisabled,
			}">
			<div class="base-accordion__header" tabindex="0" @click="toggleItem(index)" @keydown.enter="toggleItem(index)">
				<BaseIcon v-if="item.icon" :name="item.icon" size="sm" :size-scale="sizeScale" class="base-accordion__icon" />
				<BaseText tag="span" :weight="600" :size-scale="sizeScale" class="base-accordion__label">{{
					item.label
				}}</BaseText>
				<span class="base-accordion__arrow">
					<BaseIcon name="chevron-down" size="md" :size-scale="sizeScale" />
				</span>
			</div>

			<div class="base-accordion__collapse" :class="{ 'base-accordion__collapse--open': openIndexes.includes(index) }">
				<div class="base-accordion__content">
					<slot :name="item.slot || 'default'" :item="item">
						<BaseText :size-scale="sizeScale">{{ item.content }}</BaseText>
					</slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import { BaseText } from '@/shared/ui/BaseText'
import { onMounted, ref } from 'vue'

import './BaseAccordion.style.scss'
import type { BaseAccordionEmits, BaseAccordionProps } from './BaseAccordion.types'

const props = withDefaults(defineProps<BaseAccordionProps>(), {
	isMultiple: false,
	variant: 'default',
	sizeScale: 100,
})

const emit = defineEmits<BaseAccordionEmits>()

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-accordion', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const openIndexes = ref<number[]>([])

onMounted(() => {
	props.items.forEach((item, index) => {
		if (item.defaultOpen) {
			openIndexes.value.push(index)
		}
	})
})

function toggleItem(index: number): void {
	if (props.items[index].isDisabled) return

	const pos = openIndexes.value.indexOf(index)
	if (pos > -1) {
		openIndexes.value.splice(pos, 1)
		emit('toggle', index, false)
	} else {
		if (props.isMultiple) {
			openIndexes.value.push(index)
		} else {
			openIndexes.value = [index]
		}
		emit('toggle', index, true)
	}
}
</script>
