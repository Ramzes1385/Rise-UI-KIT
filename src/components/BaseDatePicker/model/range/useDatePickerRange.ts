import { warn } from '@/locales/warn'
import { computed, ref, watch } from 'vue'
import { UI_DATE_PICKER } from '@/locales/messages'
import { resolveDatePickerPresets } from './dateRangePresets'
import { isSameDay, toDateOnly } from '@utils/data/dateUtils'
import { formatMessage, getLocale, pluralize } from '@/locales/state'
import { getDateRangeExample, parseDateRangeText } from './dateRangeText'
import { createDateAvailability, findRangeIssue, resolveRangeLimits } from './dateRangeLimits'
import type {
	DatePickerInputIssue,
	DatePickerPresetItem,
	DatePickerRange,
	DatePickerTextOptions,
	RangeTextState,
	UseDatePickerRangeOptions,
} from '../../types/DatePickerRange.types'

function issueMessage(issue: DatePickerInputIssue, textOptions: DatePickerTextOptions, days: number | null): string {
	if (issue === 'format') return formatMessage(UI_DATE_PICKER.ERROR_FORMAT, { example: getDateRangeExample(textOptions) })
	if (issue === 'unavailable') return UI_DATE_PICKER.ERROR_UNAVAILABLE
	const template = issue === 'min-days' ? UI_DATE_PICKER.ERROR_MIN_DAYS : UI_DATE_PICKER.ERROR_MAX_DAYS
	return formatMessage(template, { days: pluralize(getLocale().plural.DAYS, days ?? 0) })
}

function isSameRange(range: DatePickerRange, start: Date | null, end: Date | null): boolean {
	return !!start && !!end && isSameDay(range.start, start) && isSameDay(range.end, end)
}

function useRangeRules(options: UseDatePickerRangeOptions) {
	const { resolvedProps, calendarConfig } = options
	return {
		limits: computed(() => resolveRangeLimits(resolvedProps.value.minDays, resolvedProps.value.maxDays)),
		isAvailable: computed(() => createDateAvailability(calendarConfig.value)),
		textOptions: computed((): DatePickerTextOptions => ({
			locale: calendarConfig.value.locale,
			showTime: calendarConfig.value.showTime,
			showSeconds: calendarConfig.value.showSeconds,
			is24Hour: calendarConfig.value.is24Hour,
		})),
	}
}

function usePresetItems(options: UseDatePickerRangeOptions, rules: ReturnType<typeof useRangeRules>) {
	const { resolvedProps, isOpen, activeValue, activeValueEnd, actions, emit } = options

	watch(
		() => resolvedProps.value.presets,
		presets => {
			if (presets)
				resolveDatePickerPresets({
					presets,
					today: toDateOnly(new Date()),
					onInvalid: id => warn(UI_DATE_PICKER.PRESET_INVALID, { id }),
				})
		},
		{ immediate: true },
	)

	const presetItems = computed((): DatePickerPresetItem[] => {
		if (!isOpen.value || resolvedProps.value.selectionMode !== 'range') return []
		const today = toDateOnly(new Date())
		return resolveDatePickerPresets({ presets: resolvedProps.value.presets, today }).map(preset => ({
			...preset,
			isActive: isSameRange(preset.range, activeValue.value, activeValueEnd.value),
			isDisabled: findRangeIssue(preset.range, rules.isAvailable.value, rules.limits.value) !== null,
		}))
	})

	function handlePresetSelect(id: string): void {
		const item = presetItems.value.find(preset => preset.id === id)
		if (!item || item.isDisabled) return
		emit('preset-select', item.id, item.range.start, item.range.end)
		actions.handleRangeSelect(item.range.start, item.range.end)
	}

	return { presetItems, handlePresetSelect }
}

function useTextCommit(options: UseDatePickerRangeOptions, rules: ReturnType<typeof useRangeRules>, state: RangeTextState) {
	const { displayValue, actions, emit } = options
	const { draft, inputError } = state

	function reject(issue: DatePickerInputIssue, text: string): void {
		const days = issue === 'min-days' ? rules.limits.value.minDays : rules.limits.value.maxDays
		inputError.value = issueMessage(issue, rules.textOptions.value, days)
		emit('input-invalid', issue, text)
	}

	function apply(start: Date, end: Date | null): void {
		draft.value = null
		inputError.value = ''
		if (end) {
			actions.handleRangeSelect(start, end)
			return
		}
		actions.handleModelUpdate(start)
		actions.handleModelEndUpdate(null)
	}

	function validateAndApply(start: Date, end: Date | null, text: string): void {
		const issue = findRangeIssue({ start, end: end ?? start }, rules.isAvailable.value, rules.limits.value)
		if (issue && (end || issue === 'unavailable')) reject(issue, text)
		else apply(start, end)
	}

	return function commit(text: string): void {
		if (text === displayValue.value) {
			draft.value = null
			return
		}
		const parsed = parseDateRangeText(text, rules.textOptions.value)
		if (!parsed) reject('format', text)
		else if (parsed.start) validateAndApply(parsed.start, parsed.end, text)
		else {
			draft.value = null
			actions.handleClear()
		}
	}
}

function useTextInput(options: UseDatePickerRangeOptions, rules: ReturnType<typeof useRangeRules>) {
	const { activeValue, activeValueEnd, displayValue } = options
	const state: RangeTextState = { draft: ref<string | null>(null), inputError: ref('') }
	const { draft, inputError } = state
	const commit = useTextCommit(options, rules, state)

	watch([activeValue, activeValueEnd], () => {
		draft.value = null
		inputError.value = ''
	})

	return {
		inputError,
		hasDraft: computed(() => draft.value !== null),
		fieldText: computed(() => draft.value ?? displayValue.value),
		handleTextInput(text: string): void {
			draft.value = text
			inputError.value = ''
		},
		handleTextCommit(): void {
			if (draft.value !== null) commit(draft.value)
		},
		handleTextCancel(): void {
			draft.value = null
			inputError.value = ''
		},
	}
}

export function useDatePickerRange(options: UseDatePickerRangeOptions) {
	const { resolvedProps } = options
	const rules = useRangeRules(options)

	return {
		...usePresetItems(options, rules),
		...useTextInput(options, rules),
		isFieldEditable: computed(
			() => resolvedProps.value.selectionMode === 'range' && !resolvedProps.value.isReadonly && !resolvedProps.value.isDisabled,
		),
	}
}
