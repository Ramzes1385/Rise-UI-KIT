<template>
	<div
		class="base-accordion"
		:class="[variantClass, appearanceClass, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<div
			v-for="(item, index) in items"
			:key="index"
			class="base-accordion__item"
			:class="[
				{
					'base-accordion__item--open': isOpen(index),
					'base-accordion__item--disabled': item.isDisabled,
				},
				classes.item,
			]">
			<div
				:id="getHeaderId(index)"
				class="base-accordion__header"
				:class="classes.header"
				role="button"
				tabindex="0"
				:aria-expanded="isOpen(index)"
				:aria-controls="getPanelId(index)"
				:aria-labelledby="`${getHeaderId(index)}-label`"
				:aria-describedby="item.description ? `${getHeaderId(index)}-description` : undefined"
				:aria-disabled="item.isDisabled || undefined"
				@click="toggleItem(index)"
				@keydown.enter.prevent="toggleItem(index)"
				@keydown.space.prevent="toggleItem(index)">
				<BaseIcon
					v-if="item.icon"
					:name="item.icon"
					:size-scale="calcIconScale('sm', sizeScale)"
					class="base-accordion__icon"
					:custom-class="classes.icon" />
				<span class="base-accordion__title">
					<span :id="`${getHeaderId(index)}-label`" class="base-accordion__label" :class="classes.label">{{ item.label }}</span>
					<span
						v-if="item.description"
						:id="`${getHeaderId(index)}-description`"
						class="base-accordion__description"
						:class="classes.description"
						>{{ item.description }}</span
					>
				</span>
				<span v-if="hasArrow" class="base-accordion__arrow" :class="classes.arrow">
					<BaseIcon
						:name="arrowIconName(isOpen(index))"
						:size-scale="calcIconScale('md', sizeScale)"
						:custom-class="classes.arrowIcon" />
				</span>
			</div>

			<div
				:id="getPanelId(index)"
				class="base-accordion__collapse"
				:class="[{ 'base-accordion__collapse--open': isOpen(index) }, classes.collapse]"
				role="region"
				:aria-labelledby="`${getHeaderId(index)}-label`"
				:aria-hidden="isOpen(index) ? undefined : true"
				:inert="isOpen(index) ? undefined : true">
				<div class="base-accordion__content" :class="classes.content">
					<slot :name="item.slot || 'default'" :item="item">
						<p class="base-accordion__text" :class="classes.contentText">{{ item.content }}</p>
					</slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseAccordion.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { calcIconScale } from '@utils/media/iconUtils'
import { kitDefaults } from '@composables/base/useDefaults'
import { useBaseAccordion } from '../model/useBaseAccordion'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseAccordionEmits, BaseAccordionProps, BaseAccordionSlots } from '../types/BaseAccordion.types'

const props = withDefaults(
	defineProps<BaseAccordionProps>(),
	kitDefaults('BaseAccordion', {
		variant: DEFAULT_VARIANT,
		isMultiple: false,
		arrowPosition: 'end',
		showArrow: true,
		expandIcon: 'chevron-down',
		density: 'default',
		isAccented: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAccordionEmits>()
defineSlots<BaseAccordionSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	appearanceClass,
	hasArrow,
	arrowIconName,
	isOpen,
	toggleItem,
	getHeaderId,
	getPanelId,
} = useBaseAccordion(props, emit)
</script>
