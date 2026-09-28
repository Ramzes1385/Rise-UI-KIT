/** Composable: логика BaseTimeline — текущее событие и даты */
import { computed } from 'vue'
import { getLocale } from '@/locales/state'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import type { BaseTimelineProps } from '../types/BaseTimeline.types'

/** Дата события: Date или распознаваемая строка; иначе undefined */
function toDate(value: Date | string): Date | undefined {
	const date = value instanceof Date ? value : new Date(value)
	return Number.isNaN(date.getTime()) ? undefined : date
}

export function useBaseTimeline(props: BaseTimelineProps) {
	const currentIndex = computed(() => (props.currentId === undefined ? -1 : props.items.findIndex(item => item.id === props.currentId)))

	return {
		...useStandardBaseComponent('base-timeline', props, ['root', 'item', 'marker', 'content']),
		currentIndex,
		isUpcoming: (index: number): boolean => currentIndex.value !== -1 && index > currentIndex.value,
		/** Значение атрибута datetime: ISO для даты, исходная строка иначе */
		dateTime: (value: Date | string): string => toDate(value)?.toISOString() ?? String(value),
		formatDate(value: Date | string): string {
			const date = toDate(value)
			if (!date) return String(value)
			return new Intl.DateTimeFormat(getLocale().intl, props.dateFormat ?? { day: 'numeric', month: 'long', year: 'numeric' }).format(
				date,
			)
		},
	}
}
