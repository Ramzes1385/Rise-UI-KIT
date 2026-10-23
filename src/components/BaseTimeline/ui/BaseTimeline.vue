<template>
	<ol
		:class="[ui('root'), variantClass, `base-timeline--${orientation}`, { 'base-timeline--date-side': isDateSide }, classes.root]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]">
		<li
			v-for="(item, index) in items"
			:key="item.id"
			:class="[
				ui('item'),
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
				:class="[ui('date'), 'base-timeline__date--side', classes.date]"
				:datetime="dateTime(item.date)"
				>{{ formatDate(item.date) }}</time
			>
			<span v-else-if="isDateSide" :class="[ui('date'), 'base-timeline__date--side']" />
			<span :class="[ui('marker'), classes.marker]" aria-hidden="true">
				<BaseIcon v-if="item.icon" :name="item.icon" :class="ui('icon')" :size-scale="calcIconScale('sm', sizeScale)" />
				<span v-else :class="ui('dot')" />
			</span>
			<span v-if="index < items.length - 1" :class="ui('line')" aria-hidden="true" />
			<div :class="[ui('content'), classes.content]">
				<span v-if="dayLabel(index)" :class="[ui('day'), classes.day]">{{ dayLabel(index) }}</span>
				<slot
					v-if="$slots[`item-${item.id}`]"
					:name="`item-${item.id}`"
					:item="item"
					:index="index"
					:is-current="index === currentIndex"
					:is-upcoming="isUpcoming(index)" />
				<slot v-else name="item" :item="item" :index="index" :is-current="index === currentIndex" :is-upcoming="isUpcoming(index)">
					<time v-if="item.date && !isDateSide" :class="[ui('date'), classes.date]" :datetime="dateTime(item.date)">{{
						formatDate(item.date)
					}}</time>
					<span :class="ui('title')">{{ item.title }}</span>
					<span v-if="item.description" :class="ui('description')">{{ item.description }}</span>
					<BaseImage
						v-if="item.media"
						:class="ui('media')"
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
	ui,
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
