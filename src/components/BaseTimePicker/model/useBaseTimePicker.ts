import { computed, ref } from 'vue'
import { useCustomClass } from '@composables/base/useCustomClass'
import type { TimePickerProps } from '../types/BaseTimePicker.types'
import type { AutocompleteOption, BaseAutocomplete } from '@components/BaseAutocomplete'
import { buildTimeOptions, parseTimeInput, timePrefixes, timeToMinutes } from '@utils/data/timeUtils'

function normalizeTime(props: TimePickerProps, text: string): string | null {
	const time = parseTimeInput(text)
	if (!time) return null
	const minutes = timeToMinutes(time) as number
	const min = props.minTime ? timeToMinutes(props.minTime) : undefined
	const max = props.maxTime ? timeToMinutes(props.maxTime) : undefined
	if ((min !== undefined && minutes < min) || (max !== undefined && minutes > max)) return null
	return time
}

export function useBaseTimePicker(props: TimePickerProps) {
	const autocompleteRef = ref<InstanceType<typeof BaseAutocomplete> | null>(null)

	return {
		...useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'panel', 'option'] }),
		autocompleteRef,
		options: computed((): AutocompleteOption[] =>
			buildTimeOptions(props.step, props.minTime, props.maxTime).map(time => ({ value: time, label: time })),
		),
		filterTime: (option: AutocompleteOption, query: string): boolean =>
			timePrefixes(query).some(prefix => option.label.startsWith(prefix)),
		normalizeTime: (text: string) => normalizeTime(props, text),
		toTime: (value: string | number | null): string | null => (value === null ? null : String(value)),
		exposed: {
			focus: () => autocompleteRef.value?.focus(),
			blur: () => autocompleteRef.value?.blur(),
			validate: () => autocompleteRef.value?.validate() ?? true,
			reset: () => autocompleteRef.value?.reset(),
		},
	}
}
