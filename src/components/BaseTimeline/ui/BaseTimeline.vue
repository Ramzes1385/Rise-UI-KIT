<template>
	<ol
		class="base-timeline"
		:class="[variantClass, `base-timeline--${orientation}`, { 'base-timeline--date-side': isDateSide }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<li
			v-for="(item, index) in items"
			:key="item.id"
			class="base-timeline__item"
			:class="[
				`base-timeline__item--${item.color ?? 'primary'}`,
				{
					'base-timeline__item--current': index === currentIndex,
					'base-timeline__item--upcoming': isUpcoming(index),
				},
				classes.item,
			]"
			:aria-current="index === currentIndex ? 'step' : undefined">
			<time
				v-if="isDateSide && item.date"
				class="base-timeline__date base-timeline__date--side"
				:class="classes.date"
				:datetime="dateTime(item.date)"
				>{{ formatDate(item.date) }}</time
			>
			<span v-else-if="isDateSide" class="base-timeline__date base-timeline__date--side" />
			<span class="base-timeline__marker" :class="classes.marker" aria-hidden="true">
				<BaseIcon v-if="item.icon" :name="item.icon" class="base-timeline__icon" :size-scale="calcIconScale('sm', sizeScale)" />
				<span v-else class="base-timeline__dot" />
			</span>
			<span v-if="index < items.length - 1" class="base-timeline__line" aria-hidden="true" />
			<div class="base-timeline__content" :class="classes.content">
				<span v-if="dayLabel(index)" class="base-timeline__day" :class="classes.day">{{ dayLabel(index) }}</span>
				<slot
					v-if="$slots[`item-${item.id}`]"
					:name="`item-${item.id}`"
					:item="item"
					:index="index"
					:is-current="index === currentIndex"
					:is-upcoming="isUpcoming(index)" />
				<slot v-else name="item" :item="item" :index="index" :is-current="index === currentIndex" :is-upcoming="isUpcoming(index)">
					<time
						v-if="item.date && !isDateSide"
						class="base-timeline__date"
						:class="classes.date"
						:datetime="dateTime(item.date)"
						>{{ formatDate(item.date) }}</time
					>
					<span class="base-timeline__title">{{ item.title }}</span>
					<span v-if="item.description" class="base-timeline__description">{{ item.description }}</span>
					<BaseImage
						v-if="item.media"
						class="base-timeline__media"
						:custom-class="{ root: classes.media }"
						:src="item.media.src"
						:alt="item.media.alt"
						aspect-ratio="16 / 9"
						fit="cover"
						:zoom-config="{ hasZoom: true }"
						:border-radius="8" />
				</slot>
			</div>
		</li>
	</ol>
</template>

<script setup lang="ts">
import '../styles/BaseTimeline.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { BaseImage } from '@components/BaseImage'
import { calcIconScale } from '@utils/media/iconUtils'
import { useBaseTimeline } from '../model/useBaseTimeline'
import { kitDefaults } from '@composables/base/useDefaults'
import type { BaseTimelineProps, BaseTimelineSlots } from '../types/BaseTimeline.types'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'

const props = withDefaults(
	defineProps<BaseTimelineProps>(),
	kitDefaults('BaseTimeline', {
		variant: DEFAULT_VARIANT,
		orientation: 'vertical',
		isGrouped: false,
		datePosition: 'top',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseTimelineSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isDateSide,
	dayLabel,
	currentIndex,
	isUpcoming,
	dateTime,
	formatDate,
} = useBaseTimeline(props)
</script>
