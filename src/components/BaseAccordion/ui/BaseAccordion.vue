<template>
	<div
		class="base-accordion"
		:class="[variantClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div
			v-for="(item, index) in items"
			:key="index"
			class="base-accordion__item"
			:class="[
				{
					'base-accordion__item--open': openIndexes.includes(index),
					'base-accordion__item--disabled': item.isDisabled,
				},
				classes.item,
			]">
			<div
				class="base-accordion__header"
				:class="classes.header"
				tabindex="0"
				@click="toggleItem(index)"
				@keydown.enter="toggleItem(index)">
				<BaseIcon
					v-if="item.icon"
					:name="item.icon"
					:size-scale="calcIconScale('sm', sizeScale)"
					class="base-accordion__icon"
					:custom-class="classes.icon" />
				<BaseText
					tag="span"
					:weight="UI_FONT_WEIGHT.SEMIBOLD"
					:size-scale="sizeScale"
					class="base-accordion__label"
					:custom-class="classes.label"
					>{{ item.label }}</BaseText
				>
				<span class="base-accordion__arrow" :class="classes.arrow">
					<BaseIcon
						name="chevron-down"
						:size-scale="calcIconScale('md', sizeScale)"
						:custom-class="classes.arrowIcon" />
				</span>
			</div>

			<div
				class="base-accordion__collapse"
				:class="[{ 'base-accordion__collapse--open': openIndexes.includes(index) }, classes.collapse]">
				<div class="base-accordion__content" :class="classes.content">
					<slot :name="item.slot || 'default'" :item="item">
						<BaseText :size-scale="sizeScale" :custom-class="classes.contentText">{{ item.content }}</BaseText>
					</slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { UI_FONT_WEIGHT, SIZE_SCALE_DEFAULT} from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseAccordion.style.scss'
import type { BaseAccordionEmits, BaseAccordionProps, BaseAccordionSlots } from '../model/BaseAccordion.types'

const props = withDefaults(defineProps<BaseAccordionProps>(), {
	isMultiple: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseAccordionEmits>()
defineSlots<BaseAccordionSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-accordion', props, ['root', 'item', 'header', 'icon', 'label', 'arrow', 'arrowIcon', 'collapse', 'content', 'contentText'])

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
