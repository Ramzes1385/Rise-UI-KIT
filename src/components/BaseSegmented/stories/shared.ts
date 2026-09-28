import type { SegmentedOption } from '../types/BaseSegmented.types'

export const PERIODS: SegmentedOption[] = [
	{ value: 'day', label: 'День' },
	{ value: 'week', label: 'Неделя' },
	{ value: 'month', label: 'Месяц' },
	{ value: 'year', label: 'Год', isDisabled: true },
]
