import { computed } from 'vue'
import { getLocale } from '@/locales/state'
import type { BaseTimelineProps } from '../types/BaseTimeline.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

function toDate(value: Date | string): Date | undefined {
	const date = value instanceof Date ? value : new Date(value)
	return Number.isNaN(date.getTime()) ? undefined : date
}

const DAY_FORMAT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
const TIME_FORMAT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }

function formatIntl(date: Date, options: Intl.DateTimeFormatOptions): string {
	return new Intl.DateTimeFormat(getLocale().intl, options).format(date)
}

function dayOf(value: Date | string | undefined): string | undefined {
	const date = value === undefined ? undefined : toDate(value)
	return date && formatIntl(date, DAY_FORMAT)
}

function dayLabel(props: BaseTimelineProps, index: number): string | undefined {
	if (!props.isGrouped) return undefined
	const day = dayOf(props.items[index].date)
	return day === dayOf(props.items[index - 1]?.date) ? undefined : day
}

export function useBaseTimeline(props: BaseTimelineProps) {
	const currentIndex = computed(() => (props.currentId === undefined ? -1 : props.items.findIndex(item => item.id === props.currentId)))

	return {
		...useStandardBaseComponent('base-timeline', props, ['root', 'item', 'marker', 'content', 'day', 'date', 'media']),
		isDateSide: computed(() => props.datePosition === 'side' && props.orientation !== 'horizontal'),
		dayLabel: (index: number): string | undefined => dayLabel(props, index),
		currentIndex,
		isUpcoming: (index: number): boolean => currentIndex.value !== -1 && index > currentIndex.value,
		dateTime: (value: Date | string): string => toDate(value)?.toISOString() ?? String(value),
		formatDate(value: Date | string): string {
			const date = toDate(value)
			if (!date) return String(value)
			return formatIntl(date, props.dateFormat ?? (props.isGrouped ? TIME_FORMAT : DAY_FORMAT))
		},
	}
}
