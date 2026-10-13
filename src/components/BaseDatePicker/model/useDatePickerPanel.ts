import { computed, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { partClassOf } from './datePickerUi'
import { useMotion } from '@composables/app/useMotion'
import { useLayerIndex } from '@composables/app/useLayerStack'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useTeleportTarget } from '@composables/app/useTeleportTarget'
import { useExplicitPropDetection } from '@composables/base/useExplicitPropDetection'
import type { DatePickerPanelEmits, DatePickerPanelProps } from '../types/DatePickerPanel.types'
import { useDatePickerPanelNavigation } from '@composables/calendar/useDatePickerPanelNavigation'
import { pickDatePickerCalendarConfig, toBaseCalendarProps, withoutTimeBlock } from './datePickerCalendarConfig'

const PANEL_ELEMENTS = [
	'root',
	'header',
	'navGroupPrev',
	'navGroupNext',
	'navBtn',
	'navBtnDouble',
	'navIcon',
	'yearTitle',
	'yearText',
	'calendar',
]

function resolveAreaAttrs(props: DatePickerPanelProps) {
	return { theme: props.theme ?? null, riseTheme: props.riseTheme ?? null, motionPreset: props.motionPreset ?? null }
}

function resolvePanelProps(props: DatePickerPanelProps) {
	return {
		isOpen: props.isOpen ?? false,
		selectionMode: props.selectionMode ?? 'single',
		calendarVariant: props.calendarVariant ?? 'ghost',
		sizeScale: props.sizeScale ?? 100,
		selectedDates: props.selectedDates ?? [],
		monthsCount: props.monthsCount ?? 1,
		panelStyle: props.panelStyle ?? {},
		presets: props.presets ?? [],
		...resolveAreaAttrs(props),
	}
}

function useNavigation(props: DatePickerPanelProps, resolvedProps: ComputedRef<ReturnType<typeof resolvePanelProps>>) {
	return useDatePickerPanelNavigation({
		isOpen: () => props.isOpen,
		modelValue: () => props.modelValue,
		modelValueEnd: () => props.modelValueEnd,
		selectedDates: () => resolvedProps.value.selectedDates,
		monthsCount: () => resolvedProps.value.monthsCount,
	})
}

function useCalendarBindings(props: DatePickerPanelProps, isSingleMonth: () => boolean) {
	const { resolveBooleanPropDefault } = useExplicitPropDetection()
	const resolvedCalendarConfig = computed(
		() =>
			props.calendarConfig ??
			pickDatePickerCalendarConfig({ ...props, is24Hour: resolveBooleanPropDefault('is24Hour', props.is24Hour, true) }),
	)
	const calendarBindings = computed(() =>
		toBaseCalendarProps(resolvedCalendarConfig.value, { showYear: isSingleMonth(), showTodayButton: isSingleMonth() }),
	)
	return {
		resolvedCalendarConfig,
		calendarBindings,
		secondaryCalendarBindings: computed(() => withoutTimeBlock(calendarBindings.value)),
	}
}

function useMonthMotion(currentBaseDate: Ref<Date>, panelRef: Ref<HTMLElement | null>) {
	const direction = ref<'next' | 'prev'>('next')
	watch(currentBaseDate, (next, prev) => {
		direction.value = next.getTime() < prev.getTime() ? 'prev' : 'next'
	})
	const { isReduced } = useMotion(panelRef)
	return {
		monthTransition: computed(() => `date-picker-month-${direction.value}`),
		monthMode: computed(() => (isReduced.value ? 'default' : 'out-in')),
		isMotionReduced: isReduced,
	}
}

function createRelays(emit: DatePickerPanelEmits) {
	return {
		handleModelUpdate: (value: Date | null): void => emit('model-update', value),
		handleModelEndUpdate: (value: Date | null): void => emit('model-end-update', value),
		handleSelectedUpdate: (value: Date[]): void => emit('selected-update', value),
		handleRangeSelect: (start: Date, end: Date): void => emit('range-select', start, end),
		handlePresetSelect: (id: string): void => emit('preset-select', id),
	}
}

export function useDatePickerPanel(props: DatePickerPanelProps, emit: DatePickerPanelEmits) {
	const teleportTarget = useTeleportTarget()
	const resolvedProps = computed(() => resolvePanelProps(props))
	const layerStyle = useLayerIndex(() => resolvedProps.value.isOpen)
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: PANEL_ELEMENTS })
	const panelRef = ref<HTMLElement | null>(null)
	const navigation = useNavigation(props, resolvedProps)

	return {
		ui: partClassOf(props),
		...useMonthMotion(navigation.currentBaseDate, panelRef),
		teleportTarget,
		resolvedProps,
		hasPresets: computed(() => resolvedProps.value.selectionMode === 'range' && resolvedProps.value.presets.length > 0),
		layerStyle,
		classes,
		panelRef,
		...navigation,
		...useCalendarBindings(props, () => navigation.safeMonthsCount.value === 1),
		...createRelays(emit),
		exposed: { panelRef },
	}
}
