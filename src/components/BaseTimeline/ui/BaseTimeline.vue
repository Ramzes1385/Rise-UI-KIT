<template>
	<!-- Лента — упорядоченный список: порядок событий слышен скринридеру, текущее событие — aria-current="step" -->
	<ol
		class="base-timeline"
		:class="[variantClass, `base-timeline--${orientation}`, classes.root]"
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
			<span class="base-timeline__marker" :class="classes.marker" aria-hidden="true">
				<BaseIcon v-if="item.icon" :name="item.icon" class="base-timeline__icon" :size-scale="calcIconScale('sm', sizeScale)" />
				<span v-else class="base-timeline__dot" />
			</span>
			<span v-if="index < items.length - 1" class="base-timeline__line" aria-hidden="true" />
			<div class="base-timeline__content" :class="classes.content">
				<slot name="item" :item="item" :index="index" :is-current="index === currentIndex" :is-upcoming="isUpcoming(index)">
					<time v-if="item.date" class="base-timeline__date" :datetime="dateTime(item.date)">{{ formatDate(item.date) }}</time>
					<span class="base-timeline__title">{{ item.title }}</span>
					<span v-if="item.description" class="base-timeline__description">{{ item.description }}</span>
				</slot>
			</div>
		</li>
	</ol>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getLocale } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import { kitDefaults } from '@composables/useDefaults'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseTimeline.style.scss'
import type { BaseTimelineProps, BaseTimelineSlots } from '../model/BaseTimeline.types'

const props = withDefaults(
	defineProps<BaseTimelineProps>(),
	kitDefaults('BaseTimeline', {
		variant: DEFAULT_VARIANT,
		orientation: 'vertical',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

defineSlots<BaseTimelineSlots>()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-timeline', props, [
	'root',
	'item',
	'marker',
	'content',
])

const currentIndex = computed(() => (props.currentId === undefined ? -1 : props.items.findIndex(item => item.id === props.currentId)))

function isUpcoming(index: number): boolean {
	return currentIndex.value !== -1 && index > currentIndex.value
}

/** Дата события: Date или распознаваемая строка; иначе undefined */
function toDate(value: Date | string): Date | undefined {
	const date = value instanceof Date ? value : new Date(value)
	return Number.isNaN(date.getTime()) ? undefined : date
}

/** Значение атрибута datetime: ISO для даты, исходная строка иначе */
function dateTime(value: Date | string): string {
	return toDate(value)?.toISOString() ?? String(value)
}

function formatDate(value: Date | string): string {
	const date = toDate(value)
	if (!date) return String(value)
	return new Intl.DateTimeFormat(getLocale().intl, props.dateFormat ?? { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}
</script>
