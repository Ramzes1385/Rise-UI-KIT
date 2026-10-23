import { UI_DATE_PICKER } from '@/locales/messages'
import { DATE_PICKER_PRESET_IDS } from '../../types/DatePickerRange.types'
import type {
	BaseDatePickerPreset,
	DatePickerPresetId,
	DatePickerPresetsSource,
	DatePickerRange,
	DatePickerResolvedPreset,
} from '../../types/DatePickerRange.types'

const BUILTIN_RANGES: Record<DatePickerPresetId, (today: Date) => DatePickerRange> = {
	today: today => ({ start: today, end: today }),
	yesterday: today => {
		const day = shiftDays(today, -1)
		return { start: day, end: day }
	},
	last7days: today => ({ start: shiftDays(today, -6), end: today }),
	last30days: today => ({ start: shiftDays(today, -29), end: today }),
	thisMonth: today => ({
		start: new Date(today.getFullYear(), today.getMonth(), 1),
		end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
	}),
	lastMonth: today => ({
		start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
		end: new Date(today.getFullYear(), today.getMonth(), 0),
	}),
}

function shiftDays(date: Date, days: number): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function builtinLabels(): Record<DatePickerPresetId, string> {
	return {
		today: UI_DATE_PICKER.PRESET_TODAY,
		yesterday: UI_DATE_PICKER.PRESET_YESTERDAY,
		last7days: UI_DATE_PICKER.PRESET_LAST_7_DAYS,
		last30days: UI_DATE_PICKER.PRESET_LAST_30_DAYS,
		thisMonth: UI_DATE_PICKER.PRESET_THIS_MONTH,
		lastMonth: UI_DATE_PICKER.PRESET_LAST_MONTH,
	}
}

function isBuiltinId(value: string): value is DatePickerPresetId {
	return (DATE_PICKER_PRESET_IDS as readonly string[]).includes(value)
}

function resolveCustom(preset: BaseDatePickerPreset, today: Date): DatePickerResolvedPreset | null {
	const range = preset.getRange ? preset.getRange(today) : preset.range
	if (!preset.id || !preset.label || !range) return null
	return { id: preset.id, label: preset.label, range }
}

function resolveItem(item: DatePickerPresetId | BaseDatePickerPreset, today: Date): DatePickerResolvedPreset | null {
	if (typeof item !== 'string') return resolveCustom(item, today)
	if (!isBuiltinId(item)) return null
	return { id: item, label: builtinLabels()[item], range: BUILTIN_RANGES[item](today) }
}

export function resolveDatePickerPresets(source: DatePickerPresetsSource): DatePickerResolvedPreset[] {
	const { presets, today, onInvalid } = source
	if (!presets) return []
	const items = presets === true ? DATE_PICKER_PRESET_IDS : presets
	const resolved: DatePickerResolvedPreset[] = []

	for (const item of items) {
		const preset = resolveItem(item, today)
		if (preset && !resolved.some(existing => existing.id === preset.id)) {
			resolved.push(preset)
		} else {
			onInvalid?.(typeof item === 'string' ? item : item.id)
		}
	}
	return resolved
}
