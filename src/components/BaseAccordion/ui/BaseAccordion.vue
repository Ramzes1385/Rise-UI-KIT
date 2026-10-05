<template>
	<div :class="[ui('root'), variantClass, appearanceClass, classes.root]" :style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<component :is="'script'" v-if="structuredData" type="application/ld+json" v-html="structuredData" />

		<div
			v-for="(item, index) in items"
			:key="itemKey(index)"
			:class="[
				ui('item'),
				{
					'base-accordion__item--open': isOpen(index),
					'base-accordion__item--disabled': item.isDisabled,
				},
				classes.item,
			]">
			<component :is="`h${headingLevel}`" :class="[ui('heading'), classes.heading]">
				<button
					:id="getHeaderId(index)"
					type="button"
					:class="[ui('header'), classes.header]"
					:aria-expanded="isOpen(index)"
					:aria-controls="getPanelId(index)"
					:aria-labelledby="`${getHeaderId(index)}-label`"
					:aria-describedby="item.description ? `${getHeaderId(index)}-description` : undefined"
					:aria-disabled="item.isDisabled || undefined"
					@click="toggleItem(index)"
					@keydown="handleHeaderKeydown">
					<BaseIcon
						v-if="item.icon"
						:name="item.icon"
						:size-scale="calcIconScale('sm', sizeScale)"
						:class="ui('icon')"
						:custom-class="classes.icon" />
					<span :class="ui('title')">
						<span :id="`${getHeaderId(index)}-label`" :class="[ui('label'), classes.label]">{{ item.label }}</span>
						<span
							v-if="item.description"
							:id="`${getHeaderId(index)}-description`"
							:class="[ui('description'), classes.description]"
							>{{ item.description }}</span
						>
					</span>
					<span v-if="hasArrow" :class="[ui('arrow'), classes.arrow]">
						<BaseIcon
							:name="arrowIconName(isOpen(index))"
							:size-scale="calcIconScale('md', sizeScale)"
							:custom-class="classes.arrowIcon" />
					</span>
				</button>
			</component>

			<div
				:id="getPanelId(index)"
				:class="[ui('collapse'), { 'base-accordion__collapse--open': isOpen(index) }, classes.collapse]"
				role="region"
				:aria-labelledby="`${getHeaderId(index)}-label`"
				:aria-hidden="isOpen(index) ? undefined : true"
				:inert="isOpen(index) ? undefined : true">
				<div :class="[ui('content'), classes.content]">
					<slot :name="item.slot || 'default'" :item="item">
						<p :class="[ui('text'), classes.contentText]">{{ item.content }}</p>
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
		headingLevel: 3,
		arrowPosition: 'end',
		showArrow: true,
		expandIcon: 'chevron-down',
		density: 'default',
		isAccented: false,
		seo: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseAccordionEmits>()
defineSlots<BaseAccordionSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	appearanceClass,
	hasArrow,
	arrowIconName,
	itemKey,
	isOpen,
	toggleItem,
	getHeaderId,
	getPanelId,
	handleHeaderKeydown,
	structuredData,
} = useBaseAccordion(props, emit)
</script>
